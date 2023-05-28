import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { XCircleIcon } from "@heroicons/react/outline";

import {
    closeModal,
    showConfirmationModal,
    showLoadingModal,
} from "../redux/slices/modal-slice";
import { openGallery } from "../redux/slices/gallery-slice";
import { fetcher } from "../lib/fetcher";
import { setErrorAlert } from "../redux/slices/alerts-slice";

import GalleryPreview from "./gallery-preview";

const Gallery = ({ images = [], isMyProduct, onDelete }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const dispatch = useDispatch();
    const router = useRouter();

    const productId = router.query.id;

    const handleDeleteClick = () => {
        dispatch(
            showConfirmationModal({
                message: "are you sure you want to delete this image?",
                handler: async () => {
                    dispatch(showLoadingModal("deleting product image..."));

                    try {
                        const data = await fetcher(
                            `products/${productId}/images`,
                            "DELETE",
                            {
                                src: images[activeIndex],
                            }
                        );

                        setActiveIndex(0);
                        onDelete(data.images);
                    } catch (error) {
                        dispatch(setErrorAlert(error.message));
                    } finally {
                        dispatch(closeModal());
                    }
                },
            })
        );
    };

    const handleImagePopup = () => {
        dispatch(openGallery({ images, activeIndex }));
    };

    return (
        <div className="mt-3 500:mt-0 overflow-x-hidden max-w-[15rem] 500:max-w-[11rem] 550:max-w-[13rem] 750:max-w-[15rem]">
            <div className="relative">
                {onDelete && (
                    <XCircleIcon
                        className="absolute top-1 right-1 icon-white"
                        onClick={handleDeleteClick}
                    />
                )}
                <img
                    src={images[activeIndex]}
                    className="w-60 max-h-72 image rounded mb-3 cursor-pointer"
                    onClick={handleImagePopup}
                />
            </div>

            <GalleryPreview
                images={images}
                active={activeIndex}
                isMyProduct={isMyProduct}
                setActive={setActiveIndex}
            />
        </div>
    );
};

export default Gallery;
