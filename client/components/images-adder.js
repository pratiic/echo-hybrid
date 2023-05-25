import { useRouter } from "next/router";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { capitalizeFirstLetter } from "../lib/strings";

import FileSelector from "./file-selector";
import Button from "./button";
import { fetcher } from "../lib/fetcher";
import { setActiveIndex } from "../redux/slices/gallery-slice";
import { setActiveProduct } from "../redux/slices/products-slice";
import { closeModal } from "../redux/slices/modal-slice";
import { setAlert } from "../redux/slices/alerts-slice";

const ImagesAdder = ({ currentCount }) => {
  const { selectedFiles } = useSelector((state) => state.files);
  const { authUser } = useSelector((state) => state.auth);
  const { activeProduct } = useSelector((state) => state.products);

  const [max, setMax] = useState(5 - currentCount - selectedFiles.length);
  const [error, setError] = useState("");
  const [addingImages, setAddingImages] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();

  const productId = router.query.id;

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setAddingImages(true);

    if (selectedFiles.length === 0) {
      return setError("provide atleat one image");
    }

    try {
      const formData = new FormData();

      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      const data = await fetcher(
        `products/${productId}/images`,
        "PATCH",
        formData
      );

      dispatch(
        setActiveProduct({
          images: [...activeProduct.images, ...data.images],
        })
      );

      dispatch(closeModal());
      dispatch(setAlert({ message: "product images have been added" }));
    } catch (error) {
      setError(error.message);
    } finally {
      setAddingImages(false);
    }
  };

  return (
    <form>
      <h3 className="heading-generic-modal">Add product images</h3>

      <p className="dark-light mb-3 -mt-2">
        you can still add {max} {max > 1 ? "images" : "image"}
      </p>

      <FileSelector multiple max={max} />

      {error && (
        <p className="error mb-3 -mt-1">{capitalizeFirstLetter(error)}</p>
      )}

      <Button loading={addingImages} full onClick={handleFormSubmit}>
        {addingImages ? "adding" : "add"} images
      </Button>
    </form>
  );
};

export default ImagesAdder;
