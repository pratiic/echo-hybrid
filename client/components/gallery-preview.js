import { PlusIcon } from "@heroicons/react/outline";
import React from "react";
import { useDispatch } from "react-redux";

import { showGenericModal } from "../redux/slices/modal-slice";

import ImagesAdder from "./images-adder";

const GalleryPreview = ({ images, active, isMyProduct, setActive }) => {
  const dispatch = useDispatch();
  const dimensionStyle = "h-12 w-12 500:h-10 500:w-10 550:h-12 550:w-12";
  const MAX_IMAGES = 5;

  return (
    <div
      className="flex space-x-3 overflow-x-scroll pb-3 scrollbar-thin scrollbar-thumb-scrollbar-light
            scrollbar-thumb-rounded-full dark:scrollbar-thumb-scrollbar-dark"
    >
      {images.map((image, i) => {
        return (
          <img
            src={image}
            className={`shrink-0 object-cover rounded cursor-pointer inline-block ${active ===
              i && "border-2 border-blue-three"} ${dimensionStyle}`}
            key={i}
            onClick={() => setActive(i)}
          />
        );
      })}

      {images.length < MAX_IMAGES && isMyProduct && (
        <div
          className={`flex items-center justify-center shrink-0 bg-gray-100 cursor-pointer rounded hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 dark:bg-gray-700 hover:dark:bg-gray-800 active:dark:bg-gray-700 ${dimensionStyle}`}
          onClick={() =>
            dispatch(
              showGenericModal(<ImagesAdder currentCount={images.length} />)
            )
          }
        >
          <PlusIcon className="icon-no-bg" />
        </div>
      )}
    </div>
  );
};

export default GalleryPreview;
