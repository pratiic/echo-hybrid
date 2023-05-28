import React, { useRef, useEffect, useState } from "react";
import { CameraIcon, PhotographIcon, XIcon } from "@heroicons/react/outline";
import { useDispatch, useSelector } from "react-redux";
import { BsImage } from "react-icons/bs";
import { capitalizeFirstLetter } from "../lib/strings";

import {
    selectFiles,
    resetFiles,
    unselectFile,
} from "../redux/slices/files-slices";
import Button from "./button";
import Icon from "./icon";
import Image from "./image";

const FileSelector = ({
    label,
    multiple,
    error,
    prevSrc,
    type,
    max = Infinity,
    deletionHandler,
    isRequired = false,
    disabled = false,
}) => {
    const [previewSrcs, setPreviewSrcs] = useState([]);

    const inputRef = useRef();
    const dispatch = useDispatch();
    const { selectedFiles } = useSelector((state) => state.files);

    useEffect(() => {
        return () => {
            dispatch(resetFiles([]));
        };
    }, []);

    useEffect(() => {
        if (selectedFiles?.length > 0) {
            [].forEach.call(selectedFiles, createImagePreview);
        } else {
            setPreviewSrcs([]);
        }
    }, [selectedFiles]);

    useEffect(() => {
        setPreviewSrcs(multiple ? [] : prevSrc ? [prevSrc] : []);
    }, [prevSrc, multiple]);

    const handleButtonClick = (event) => {
        event.preventDefault();

        inputRef.current.click();
    };

    const handleInputChange = (event) => {
        if (!multiple) {
            dispatch(resetFiles());
        }
        dispatch(selectFiles({ files: event.target.files, max }));
    };

    const renderPreviewPlaceholder = () => {
        return (
            <div className="flex justify-center items-center h-48 w-56 bg-gray-three rounded dark:bg-gray-700">
                <BsImage className="text-gray-300 dark:text-gray-500 h-14 w-14" />
            </div>
        );
    };

    const renderPreviewImages = () => {
        if (!multiple) {
            return (
                <Image
                    src={previewSrcs[0]}
                    className="rounded max-w-[14rem] max-h-[15rem] min-h-[12rem]"
                    deletionHandler={deletionHandler}
                />
            );
        }

        return (
            <div className="text-gray-one px-2">
                {selectedFiles.map((selectedFile, index) => {
                    return (
                        <p
                            className="flex items-center text-sm dark-light"
                            key={index}
                        >
                            <span className="mr-1">{index + 1}.</span>
                            <span className="flex-1">
                                {selectedFile.name}
                            </span>{" "}
                            <XIcon
                                className="icon-small"
                                onClick={() => dispatch(unselectFile(index))}
                            />
                        </p>
                    );
                })}
            </div>
        );
    };

    const renderFileInput = () => {
        return (
            <input
                type="file"
                accept=".jpg, .jpeg, .png"
                ref={inputRef}
                className="hidden"
                multiple={multiple}
                onChange={handleInputChange}
            />
        );
    };

    const createImagePreview = (file) => {
        const fileReader = new FileReader();

        fileReader.addEventListener("load", function() {
            setPreviewSrcs([this.result, ...previewSrcs]);
        });

        fileReader.readAsDataURL(file);
    };

    // if type is icon, only show an icon and a file input
    if (type === "icon") {
        return (
            <React.Fragment>
                <Icon
                    onClick={handleButtonClick}
                    toolName={`select ${multiple ? "images" : "image"}`}
                >
                    <PhotographIcon className="icon" />
                </Icon>
                {renderFileInput()}
            </React.Fragment>
        );
    }

    return (
        <div className="w-fit mb-5">
            {label && (
                <label className="ml-1 block capitalize dark-light mb-1">
                    {label}

                    {isRequired && <span className="ml-1">*</span>}
                </label>
            )}
            {renderFileInput()}

            <div className="w-fit">
                <div className="mb-3">
                    {previewSrcs.length > 0
                        ? renderPreviewImages()
                        : renderPreviewPlaceholder()}
                </div>

                {selectedFiles?.length < max && !disabled && (
                    <Button
                        type="secondary"
                        center
                        rounded={false}
                        onClick={handleButtonClick}
                    >
                        <CameraIcon className="icon-no-bg mr-2" /> select{" "}
                        {multiple ? "images" : "image"}
                    </Button>
                )}
            </div>

            {error && (
                <span className="text-sm text-red-400 mt-2 ml-1 block">
                    {error.toLowerCase() === "file too large"
                        ? "Maximum file size is 3 mb"
                        : capitalizeFirstLetter(error)}
                </span>
            )}
        </div>
    );
};

export default FileSelector;
