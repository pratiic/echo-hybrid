import uniqid from "uniqid";

export const prepareImageData = (type, typeId, file) => {
    const uniqueStr = uniqid();

    const src = `http://localhost:8000/api/images/?type=${type}&id=${typeId}&uni=${uniqueStr}`;
    const imageData = {
        src,
        binary: file.buffer,
        uniqueStr,
        [`${type}Id`]: typeId,
    };

    return imageData;
};

export const buildProductImages = (productId, files) => {
    const images = [];
    const imageSources = [];

    files.forEach((file) => {
        // all product images have the same product id url, so a unique identifier uni is required for each image
        const imageData = prepareImageData("product", productId, file);
        images.push(imageData);
        imageSources.push(imageData.src);
    });

    return { images, imageSources };
};
