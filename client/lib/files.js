export const setPreview = (file, setImagePreview) => {
    // generate preview url
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);

    fileReader.onload = (readerEvent) => {
        setImagePreview(readerEvent.target.result);
    };
};
