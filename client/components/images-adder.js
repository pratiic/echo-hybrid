import { useRouter } from "next/router";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { capitalizeFirstLetter } from "../lib/strings";

import FileSelector from "./file-selector";
import Button from "./button";

const ImagesAdder = ({ currentCount }) => {
  const { selectedFiles } = useSelector((state) => state.files);
  const { authUser } = useSelector((state) => state.auth);

  const [max, setMax] = useState(5 - currentCount - selectedFiles.length);
  const [error, setError] = useState("");
  const [addingImages, setAddingImages] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();

  const productId = router.query.id;

  const handleFormSubmit = () => {
    console.log("add");
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
