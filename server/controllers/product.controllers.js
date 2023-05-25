import { notFoundHandler } from "../lib/errors.lib.js";
import { buildProductImages, getUniqueStr } from "../lib/image.lib.js";
import prisma from "../lib/prisma.lib.js";
import { trimValues } from "../lib/strings.lib.js";
import { HttpError } from "../models/http-error.models.js";
import { validateProduct } from "../validators/product.validators.js";
import { genericUserFields } from "../lib/data-source.lib.js";

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
    } = productInfo;
    [name, description, per, brand, madeIn, stockType, category, subCategory] =
        trimValues(
            name,
            description,
            per,
            brand,
            madeIn,
            stockType,
            category,
            subCategory
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
                isActive: forBusiness ? false : true, // brand new products are activated only after setting the stock
                deliveryCharge: parseInt(deliveryCharge),
                categoryName: category,
                subCategory,
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

        response.json({
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
                new HttpError("the provided product category does not exist")
            );
        }

        next(new HttpError());
    }
};

export const getProducts = async (request, response, next) => {
    let user = request.user;
    user.address = user.address || {};
    const filter = request.query.filter || "all";
    const sortType = request.query.sortType || "desc";
    const sortBy = request.query.sortBy || "createdAt";
    const category = request.query.category;
    const searchQuery = request.query.query || "";
    const storeId = parseInt(request.query.storeId);

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
        province: getAddressFilter("province"),
        city: getAddressFilter("city"),
        area: getAddressFilter("area"),
        delivered: {
            AND: [],
        },
    };

    let primaryFilter = {
        isDeleted: false,
        // NOT: {
        //     stock: null,
        // },
    };

    if (storeId) {
        // products belongining to a store
        primaryFilter.storeId = storeId;
    }

    if (category) {
        // products of a particular category
        primaryFilter.categoryName = category;
    }

    try {
        const products = await prisma.product.findMany({
            where: {
                ...filterMap[filter],
                ...primaryFilter,
            },
            include: {
                store: {
                    include: {
                        user: {
                            include: {
                                address: true,
                            },
                        },
                    },
                },
            },
            orderBy: [
                {
                    [sortBy]: sortType,
                },
                {
                    createdAt: "asc",
                },
            ],
        });

        response.json({ products });
    } catch (error) {
        next(new HttpError());
    }
};

export const getProductDetails = async (request, response, next) => {
    const productId = parseInt(request.params.productId) || 0;

    try {
        const product = await prisma.product.findUnique({
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
                    },
                },
                variations: true,
                ratings: true,
            },
        });

        if (!product) {
            return next(new HttpError("product not found", 404));
        }

        response.json({ product });
    } catch (error) {
        next(new HttpError());
    }
};

export const updateProduct = async (request, response, next) => {
    const product = request.product;
    const updateInfo = request.body;

    const errorMsg = validateProduct({
        ...product,
        category: product.categoryName,
        ...updateInfo,
    });

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

        response.json({ product: updatedProduct });
    } catch (error) {
        next(new HttpError());
    }
};

export const deleteProduct = async (request, response, next) => {
    const product = request.product;

    try {
        await prisma.product.update({
            where: { id: product.id },
            data: {
                storeId: null,
            },
        });

        await Promise.all(
            ["review"].map((model) => {
                return prisma[model].deleteMany({
                    where: {
                        productId: product.id,
                    },
                });
            })
        );

        response.json({ message: "product deleted" });
    } catch (error) {
        next(new HttpError());
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
    }
};

function createPrice(price) {
    return parseFloat(parseFloat(price).toFixed());
}
