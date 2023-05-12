import { buildProductImages } from "../lib/image.lib.js";
import prisma from "../lib/prisma.lib.js";
import { trimValues } from "../lib/strings.lib.js";
import { HttpError } from "../models/http-error.models.js";
import { validateProduct } from "../validators/product.validators.js";

export const postProduct = async (request, response, next) => {
    const user = request.user;
    const store = user.store;
    const productInfo = request.body;
    const MAX_IMAGES = 5;
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
    } = productInfo;
    [name, description, per, brand, madeIn, stockType] = trimValues(
        name,
        description,
        per,
        brand,
        madeIn,
        stockType
    );

    // if (forBusiness && stockType !== "flat" && stockType !== "varied") {
    //     return next(new HttpError("invalid stock type", 400));
    // }

    try {
        const createdProduct = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(parseFloat(price).toFixed(2)),
                isSecondHand: forBusiness ? false : true,
                per,
                brand,
                madeIn,
                stockType: forBusiness ? stockType : null,
                isActive: forBusiness ? false : true, // brand new products are activated only after setting the stock
                deliveryCharge: parseInt(deliveryCharge),
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
            product: createdProduct,
        });
    } catch (error) {
        console.log(error);
        next(new HttpError());
    }
};
