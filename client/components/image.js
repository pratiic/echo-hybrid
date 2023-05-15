import React from "react";
import { XCircleIcon } from "@heroicons/react/outline";

const Image = ({
  src,
  alt,
  className,
  containerClassName,
  deletionHandler,
}) => {
  return (
    <div className={`${containerClassName} inline-block relative`}>
      {deletionHandler && (
        <XCircleIcon
          className="absolute top-0 right-0 icon-white"
          onClick={deletionHandler}
        />
      )}

      <img src={src} className={`${className} image`} alt={alt} />
    </div>
  );
};

export default Image;
