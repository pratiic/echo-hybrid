import React, { useRef, useEffect, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, XIcon } from "@heroicons/react/outline";
import { useSelector, useDispatch } from "react-redux";
import { setActiveIndex, closeGallery } from "../redux/slices/gallery-slice";

const PopupGallery = () => {
    const { activeIndex, images } = useSelector((state) => state.gallery);
    const [singleImage, setSingleImage] = useState(false);
    const dispatch = useDispatch();
    const containerRef = useRef();

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.focus();
        }
    });

    useEffect(() => {
        setSingleImage(images.length === 1);
    }, [images]);

    const handleOverlayClick = (e) => {
        if (e.target.id === "overlay") {
            dispatch(closeGallery());
        }
    };

    const changePopupImage = (action) => {
        if (action === "inc") {
            if (activeIndex === images.length - 1) {
                dispatch(setActiveIndex(0));
            } else {
                dispatch(setActiveIndex(activeIndex + 1));
            }
        } else {
            if (activeIndex === 0) {
                dispatch(setActiveIndex(images.length - 1));
            } else {
                dispatch(setActiveIndex(activeIndex - 1));
            }
        }
    };

    const handleKeyPress = (event) => {
        if (event.code === "ArrowLeft") {
            changePopupImage("dec");
        }

        if (event.code === "ArrowRight") {
            changePopupImage("inc");
        }

        if (event.code === "Escape") {
            dispatch(closeGallery());
        }
    };

    if (images.length === 0) {
        return null;
    }

    return (
        <div
            id="overlay"
            className="bg-modal-light flex items-center justify-center fixed top-0 left-0 h-screen w-screen z-30 outline-none scrollbar-thin"
            ref={containerRef}
            tabIndex={-1}
            onClick={handleOverlayClick}
            onKeyDown={handleKeyPress}
        >
            <XIcon
                className="icon-gallery top-5 right-5"
                onClick={() => dispatch(closeGallery())}
            />

            {!singleImage && (
                <ArrowLeftIcon
                    className="icon-gallery-arrow left-5"
                    onClick={() => changePopupImage("dec")}
                />
            )}

            <div>
                <img
                    src={images[activeIndex]}
                    className="max-h-screen max-w-full"
                />

                {!singleImage && (
                    <p className="text-gray-one absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-five rounded-sm opacity-80">
                        {activeIndex + 1} of {images.length}
                    </p>
                )}
            </div>

            {!singleImage && (
                <ArrowRightIcon
                    className="icon-gallery-arrow right-5"
                    onClick={() => changePopupImage("inc")}
                />
            )}
        </div>
    );
};

export default PopupGallery;
