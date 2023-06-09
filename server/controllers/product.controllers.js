import { notFoundHandler } from "../lib/errors.lib.js";
import { buildProductImages, getUniqueStr } from "../lib/image.lib.js";
import prisma from "../lib/prisma.lib.js";
import { trimValues } from "../lib/strings.lib.js";
import { HttpError } from "../models/http-error.models.js";
import { validateProduct } from "../validators/product.validators.js";
import {
    genericUserFields,
    productSelectionFields,
} from "../lib/data-source.lib.js";
import { checkDeliverySingle } from "../lib/delivery.lib.js";
import { fetcher } from "../lib/http.lib.js";

const MAX_IMAGES = 5;

export const postProduct = async (request, response, next) => {
    const user = request.user;
    const store = user.store;
    const productInfo = request.body;
    const forBusiness = store?.storeType === "BUS";

    const errorMsg = validateProduct(productInfo, !forBusiness);

    if (errorMsg) {
        return next(new HttpError(errorMsg, 400));
    }

    // must have a store to post product
    if (!store) {
        return next(new HttpError("you must register as a seller first", 400));
    }

    if (forBusiness && !store.business) {
        return next(new HttpError("you must register a business first", 400));
    }

    if (forBusiness && !store.business.isVerified) {
        return next(
            new HttpError(
                "your business must be verified before you can sell products",
                400
            )
        );
    }

    if (!request.files || request.files.length === 0) {
        return next(new HttpError("provide at least one image", 400));
    }

    let {
        name,
        description,
        price,
        per,
        brand,
        madeIn,
        stockType,
        deliveryCharge,
        category,
        subCategory,
        warranty,
    } = productInfo;
    [
        name,
        description,
        per,
        brand,
        madeIn,
        stockType,
        category,
        subCategory,
        warranty,
    ] = trimValues(
        name,
        description,
        per,
        brand,
        madeIn,
        stockType,
        category,
        subCategory,
        warranty
    );

    try {
        const createdProduct = await prisma.product.create({
            data: {
                name,
                description,
                price: createPrice(price),
                isSecondHand: forBusiness ? false : true,
                per,
                brand,
                madeIn,
                stockType: forBusiness ? stockType : null,
                deliveryCharge: parseInt(deliveryCharge),
                categoryName: category,
                subCategory,
                warranty: forBusiness ? parseInt(warranty) || 0 : 0,
                storeId: store.id,
            },
        });

        // handle product images
        const { images: productImages, imageSources } = buildProductImages(
            createdProduct.id,
            request.files.slice(0, MAX_IMAGES)
        );

        const [, updatedProduct] = await Promise.all([
            prisma.image.createMany({
                data: productImages,
            }),
            prisma.product.update({
                where: { id: createdProduct.id },
                data: { images: imageSources },
            }),
        ]);

        try {
            // send the created product data to the recommender
            await fetcher("similar/products", "POST", {
                id: updatedProduct.id,
                name,
                categoryName: category,
                subCategory,
                brand,
            });
        } catch (error) {
            console.log(error);
        }

        response.status(201).json({
            product: updatedProduct,
        });
    } catch (error) {
        // handle invalid category
        if (
            error.message
                .toLowerCase()
                .includes("foreign key constraint failed")
        ) {
            return next(
                new HttpError(
                    "the provided product category does not exist",
                    400
                )
            );
        }

        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};

export const getProducts = async (request, response, next) => {
    let user = request.user;
    user.address = user.address || {};
    let filter = request.query.filter || "all";
    const sortType = request.query.sortType || "desc";
    let sortBy = request.query.sortBy || "createdAt";
    const category = request.query.category;
    const searchQuery = request.query.query || "";
    const page = parseInt(request.query.page) || 1;
    const storeId = parseInt(request.query.storeId);
    const PAGE_SIZE = 15;

    if (sortBy === "date added") {
        sortBy = "createdAt";
    }

    const getAddressFilter = (field) => {
        return {
            OR: [
                {
                    isSecondHand: true,
                    store: {
                        user: {
                            address: {
                                [field]: user.address[field],
                            },
                        },
                    },
                },
                {
                    isSecondHand: false,
                    store: {
                        business: {
                            address: {
                                [field]: user.address[field],
                            },
                        },
                    },
                },
            ],
        };
    };

    const filterMap = {
        all: {},
        "second hand": {
            isSecondHand: true,
        },
        "brand new": {
            isSecondHand: false,
        },
        "sold out": {
            hasBeenSold: true,
        },
        suspended: {
            NOT: {
                suspension: null,
            },
        },
        province: getAddressFilter("province"),
        city: getAddressFilter("city"),
        area: getAddressFilter("area"),
        delivered: () => {
            if (!checkDeliverySingle(user.address)) {
                return {
                    id: -1,
                };
            }

            return {
                OR: [
                    {
                        isSecondHand: true,
                        store: {
                            user: {
                                address: {
                                    province: "bagmati",
                                    city: {
                                        in: [
                                            "kathmandu",
                                            "bhaktapur",
                                            "lalitpur",
                                        ],
                                    },
                                },
                            },
                        },
                    },
                    {
                        isSecondHand: false,
                        store: {
                            business: {
                                address: {
                                    province: "bagmati",
                                    city: {
                                        in: [
                                            "kathmandu",
                                            "bhaktapur",
                                            "lalitpur",
                                        ],
                                    },
                                },
                            },
                        },
                    },
                ],
            };
        },
    };

    let primaryFilter = {
        isDeleted: false,
        NOT: {
            name: "new product",
        },
    };

    if (storeId) {
        // products belongining to a store
        if (filter === "recommended") {
            filter = "all";
        }

        primaryFilter.storeId = storeId;
    }

    if (
        (!storeId && !user.isAdmin) ||
        (storeId && storeId !== user.store?.id && !user.isAdmin)
    ) {
        // if stock not set or if a second hand product has been sold -> only show inside the store of the requesting user
        primaryFilter = {
            ...primaryFilter,
            OR: [
                {
                    isSecondHand: true,
                },
                {
                    isSecondHand: false,
                    NOT: {
                        stock: null,
                    },
                },
            ],
            suspension: null,
            store: {
                suspension: null,
            },
        };
    }

    if (searchQuery) {
        const fields = ["name", "brand", "subCategory"];

        const searchFilter = {
            OR: [
                ...fields.map((field) => {
                    return {
                        [field]: {
                            contains: searchQuery.trim(),
                            mode: "insensitive",
                        },
                    };
                }),
                {
                    id: {
                        equals: parseInt(searchQuery.trim()) || -1,
                    },
                },
            ],
        };

        // primaryFilter = { ...primaryFilter, ...searchFilter };
        primaryFilter = {
            ...primaryFilter,
            AND: [...(primaryFilter.AND || []), searchFilter],
        };
    }

    if (category) {
        // products of a particular category
        primaryFilter.categoryName = category;
    }

    let whereObj = {
        ...primaryFilter,
        ...(filter === "delivered" ? filterMap[filter]() : filterMap[filter]),
    };

    let recommendedProductInfo = [];

    if (filter === "recommended") {
        recommendedProductInfo = await fetcher(`recommendations/${user.id}`);
        const recommendedProductIds = recommendedProductInfo.map((info) => {
            return info.productId;
        });

        whereObj = {
            ...whereObj,
            id: {
                in: recommendedProductIds,
            },
        };
    }

    try {
        let [products, totalCount] = await Promise.all([
            prisma.product.findMany({
                where: whereObj,
                select: productSelectionFields,
                orderBy: [
                    {
                        [sortBy]: sortType,
                    },
                    {
                        createdAt: "asc",
                    },
                ],
                take: PAGE_SIZE,
                skip: (page - 1) * PAGE_SIZE,
            }),
            prisma.product.count({
                where: whereObj,
            }),
        ]);

        // post processing for recommended products
        if (filter === "recommended") {
            // assign each product its corresponding similarity for sorting
            products = products.map((product) => {
                return {
                    ...product,
                    similarity: recommendedProductInfo.find(
                        (info) => info.productId === product.id
                    ).similarity,
                };
            });

            // sort products based on similarity
            // products.sort((a, b) => b.similarity - a.similarity);
        }

        response.json({ products, totalCount });
    } catch (error) {
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};

// export const searchProducts = async (request, response, next) => {
//     let user = request.user;
//     user.address = user.address || {};
//     const searchQuery = request.params.query;
//     const filter = request.query.filter || "all";
//     const sortType = request.query.sortType || "desc";
//     let sortBy = request.query.sortBy || "createdAt";
//     const storeId = request.query.storeId;
//     const page = parseInt(request.query.page) || 1;
//     const PAGE_SIZE = 15;

//     if (sortBy === "date added") {
//         sortBy = "createdAt";
//     }

//     const filterMap = getBaseFilterMap(user.address, filter);
//     const fields = ["name", "brand", "categoryName", "subCategory"];

//     let primaryFilter = {
//         OR: fields.map((field) => {
//             return {
//                 [field]: {
//                     contains: searchQuery.trim(),
//                     mode: "insensitive",
//                 },
//             };
//         }),
//     };

//     if (storeId) {
//         // products belongining to a store
//         primaryFilter.storeId = storeId;
//     }

//     if (
//         (!storeId && !user.isAdmin) ||
//         (storeId && storeId !== user.store?.id && !user.isAdmin)
//     ) {
//         // only show suspended products and products of a supsended seller to the admin or inside the store of the requesting user
//         primaryFilter = {
//             ...primaryFilter,
//             suspension: null,
//             store: {
//                 suspension: null,
//             },
//         };
//     }

//     primaryFilter = {
//         ...primaryFilter,
//         ...(filter === "delivered" ? filterMap[filter]() : filterMap[filter]),
//         isDeleted: false,
//         NOT: {
//             name: "new product", // when tests are run, they result in some residue products named "new product"
//         },
//     };

//     try {
//         const [products, totalCount] = await Promise.all([
//             prisma.product.findMany({
//                 where: primaryFilter,
//                 select: productSelectionFields,
//                 orderBy: [
//                     {
//                         [sortBy]: sortType,
//                     },
//                     {
//                         createdAt: "asc",
//                     },
//                 ],
//                 take: PAGE_SIZE,
//                 skip: (page - 1) * PAGE_SIZE,
//             }),
//             prisma.product.count({
//                 where: primaryFilter,
//             }),
//         ]);

//         response.json({
//             products,
//             totalCount,
//         });
//     } catch (error) {
//         next(new HttpError());
//     }
// };

export const getProductDetails = async (request, response, next) => {
    const productId = parseInt(request.params.productId) || 0;

    try {
        // get product details and similar product Ids parallelly for efficiency
        // if the product is not found, similar products will also be empty
        const [product, similarProductInfo] = await Promise.all([
            prisma.product.findUnique({
                where: {
                    id: productId,
                },
                include: {
                    stock: true,
                    store: {
                        include: {
                            user: {
                                select: {
                                    ...genericUserFields,
                                    address: true,
                                },
                            },
                            business: {
                                select: {
                                    id: true,
                                    name: true,
                                    address: true,
                                },
                            },
                            suspension: {
                                select: {
                                    id: true,
                                },
                            },
                        },
                    },
                    variations: true,
                    ratings: true,
                    suspension: {
                        select: {
                            id: true,
                        },
                    },
                },
            }),
            fetcher(`similar/${productId}`),
        ]);

        if (!product) {
            return next(new HttpError("product not found", 404));
        }

        if (product.isDeleted) {
            return next(new HttpError("this product has been deleted", 404));
        }

        // get similar products
        let similarProducts = [];

        try {
            const similarProductIds = similarProductInfo.map((info) => {
                return info.productId;
            });

            similarProducts = await prisma.product.findMany({
                where: {
                    id: {
                        in: similarProductIds,
                    },
                },
                select: productSelectionFields,
            });

            similarProducts = similarProducts.map((similarProduct) => {
                return {
                    ...similarProduct,
                    similarity: similarProductInfo.find(
                        (info) => info.productId === similarProduct.id
                    ).similarity,
                };
            });

            similarProducts.sort((a, b) => b.similarity - a.similarity);
        } catch (error) {
            console.log(error.message);
        }

        response.json({ product: { ...product, similar: similarProducts } });
    } catch (error) {
        console.log(error);
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};

export const updateProduct = async (request, response, next) => {
    const product = request.product;
    const updateInfo = request.body;

    const errorMsg = validateProduct(
        {
            ...product,
            category: product.categoryName,
            ...updateInfo,
        },
        product.isSecondHand
    );

    if (errorMsg) {
        return next(new HttpError(errorMsg, 400));
    }

    let { name, description, price, per, deliveryCharge, brand, madeIn } =
        updateInfo;
    [name, description, per, brand, madeIn] = trimValues(
        name,
        description,
        per,
        brand,
        madeIn
    );

    try {
        const updatedProduct = await prisma.product.update({
            where: {
                id: product.id,
            },
            data: {
                name: name || product.name,
                description: description || product.description,
                price: price ? createPrice(price) : createPrice(product.price),
                per: per || product.per,
                deliveryCharge:
                    parseInt(deliveryCharge) || product.deliveryCharge,
                brand: brand || product.brand,
                madeIn: madeIn || product.madeIn,
            },
        });

        // update the product in the recommender as well
        try {
            await fetcher("similar/products", "POST", {
                id: updatedProduct.id,
                name: updatedProduct.name,
                categoryName: updatedProduct.categoryName,
                subCategory: updatedProduct.subCategory,
                brand: updatedProduct.brand,
            });
        } catch (error) {}

        response.json({ product: updatedProduct });
    } catch (error) {
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};

export const deleteProduct = async (request, response, next) => {
    const product = request.product;
    const io = request.io;

    try {
        await prisma.product.updateMany({
            where: { id: product.id },
            data: {
                storeId: null,
                isDeleted: true,
                categoryName: null,
            },
        });

        await Promise.all(
            ["review", "rating", "productVariation", "stock"].map((model) => {
                return prisma[model].deleteMany({
                    where: {
                        productId: product.id,
                    },
                });
            })
        );

        await fetcher(`similar/products/${product.id}`, "DELETE");

        io.emit("product-delete", product.id);

        response.json({ message: "the product has been deleted" });
    } catch (error) {
        console.log(error);
        next(new HttpError());
    } finally {
    }
};

export const addProductImages = async (request, response, next) => {
    const product = request.product;

    // check if at least one images has been provided
    if (!request.files || request.files.length === 0) {
        return next(new HttpError("provide atleast one image", 400));
    }

    if (product.images.length === MAX_IMAGES) {
        return next(
            new HttpError(
                `maximum limit ${MAX_IMAGES} of product images reached`,
                400
            )
        );
    }

    // only add images so that new images + existing images = MAX_IMAGES
    const imagesToAdd = [];
    let i = 0;

    while (i < MAX_IMAGES - product.images.length && i < request.files.length) {
        imagesToAdd.push(request.files[i]);
        i++;
    }

    // build images from the files
    const { images: productImages, imageSources } = buildProductImages(
        product.id,
        imagesToAdd
    );

    // create images and add image sources to the images field of
    // the product
    try {
        await Promise.all([
            prisma.image.createMany({
                data: productImages,
            }),
            prisma.product.update({
                where: { id: product.id },
                data: { images: [...product.images, ...imageSources] },
            }),
        ]);

        response.json({ images: imageSources });
    } catch (error) {
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};

export const deleteProductImage = async (request, response, next) => {
    const { src } = request.body;
    const product = request.product;

    // a product must have atleast one image
    if (product.images.length === 1) {
        return next(
            new HttpError("a product must have atleast one image", 400)
        );
    }

    // check if the given src is actually an image of the product
    if (!product.images.find((image) => image === src)) {
        return next(
            new HttpError("this image does not belong to this product", 400)
        );
    }

    try {
        const uniqueStr = getUniqueStr(src);
        let newImages = product.images.filter((image) => image !== src);

        // delete the image and image source from the images field
        // of the product
        await Promise.all([
            prisma.image.delete({
                where: { uniqueStr },
            }),
            prisma.product.update({
                where: { id: product.id },
                data: {
                    images: newImages,
                },
            }),
        ]);

        response.json({ images: newImages });
    } catch (error) {
        console.log(error);
        notFoundHandler(error.message, "image", next);
        return next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};

function createPrice(price) {
    return parseFloat(parseFloat(price).toFixed());
}

// function getAddressFilter(field, address) {
//     return {
//         OR: [
//             {
//                 isSecondHand: true,
//                 store: {
//                     user: {
//                         address: {
//                             [field]: address[field],
//                         },
//                     },
//                 },
//             },
//             {
//                 isSecondHand: false,
//                 store: {
//                     business: {
//                         address: {
//                             [field]: address[field],
//                         },
//                     },
//                 },
//             },
//         ],
//     };
// }

// function getBaseFilterMap(address) {
//     const baseFilterMap = {
//         "second hand": {
//             isSecondHand: true,
//         },
//         "brand new": {
//             isSecondHand: false,
//         },
//         province: getAddressFilter("province", address),
//         city: getAddressFilter("city", address),
//         area: getAddressFilter("area", address),
//         delivered: () => {
//             if (!checkDeliverySingle(address)) {
//                 return {
//                     id: -1,
//                 };
//             }

//             return {
//                 OR: [
//                     {
//                         isSecondHand: true,
//                         store: {
//                             user: {
//                                 address: {
//                                     province: "bagmati",
//                                     city: {
//                                         in: [
//                                             "kathmandu",
//                                             "bhaktapur",
//                                             "lalitpur",
//                                         ],
//                                     },
//                                 },
//                             },
//                         },
//                     },
//                     {
//                         isSecondHand: false,
//                         store: {
//                             business: {
//                                 address: {
//                                     province: "bagmati",
//                                     city: {
//                                         in: [
//                                             "kathmandu",
//                                             "bhaktapur",
//                                             "lalitpur",
//                                         ],
//                                     },
//                                 },
//                             },
//                         },
//                     },
//                 ],
//             };
//         },
//     };

//     return baseFilterMap;
// }
