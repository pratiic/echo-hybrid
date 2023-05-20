import React, { useState } from "react";

const Gallery = ({ images, isMyProduct, onDelete }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="mt-3 500:mt-0 overflow-x-hidden max-w-[15rem] 500:max-w-[11rem] 550:max-w-[13rem] 750:max-w-[15rem]">
      <div className="relative">
        {onDelete && (
          <XCircleIcon
            className="absolute top-1 right-1 icon-white"
            // onClick={handleDeleteClick}
          />
        )}
        <img
          //  src={images[activeIndex]}
          className="w-60 max-h-72 image rounded mb-3 cursor-pointer"
          //  onClick={handleImagePopup}
        />
      </div>
    </div>
  );
};

export default Gallery;
