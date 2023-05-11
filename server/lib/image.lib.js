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