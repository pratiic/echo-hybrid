import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { useRouter } from "next/router";

import { clearErrors, displayError } from "../lib/validation";
import { generateFormData } from "../lib/form-data";
import { fetcher } from "../lib/fetcher";
import { setAlert } from "../redux/slices/alerts-slice";

import Form from "../components/form";
import InputGroup from "../components/input-group";
import Button from "../components/button";
import FileSelector from "../components/file-selector";

const SetProduct = () => {
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [price, setPrice] = useState(0);
  const [priceError, setPriceError] = useState("");
  const [per, setPer] = useState("");
  const [perError, setPerError] = useState("");
  const [stockType, setStockType] = useState("flat");
  const [category, setCategory] = useState("accessories");
  const [subCategory, setSubcategory] = useState("");
  const [subcategoryError, setSubcategoryError] = useState("");
  const [brand, setBrand] = useState("");
  const [brandError, setBrandError] = useState("");
  const [madeIn, setMadeIn] = useState("");
  const [madeInError, setMadeInError] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [deliveryChargeError, setDeliveryChargeError] = useState("");
  const [imagesError, setImagesError] = useState("");
  const [loading, setLoading] = useState(false);

  const { categories } = useSelector((state) => state.categories);
  const { authUser } = useSelector((state) => state.auth);
  const { selectedFiles } = useSelector((state) => state.files);

  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const store = authUser?.store;

    //redirect if user has not registered as a seller
    if (!store) {
      router.push("/sell-products");
    }

    //redirect if business has not been registered and verified
    if (store && store?.storeType === "BUS") {
      if (!store?.business) {
        router.push("/business-registration/details");
      }

      if (store?.business && !store?.business?.isVerified) {
        router.push("/business-registration/details");
      }
    }
  }, [authUser?.store]);

  const stockTypeOptions = [
    { label: "flat", value: "flat" },
    { label: "varied", value: "varied" },
  ];
  const categoryOptions = categories.map((category) => {
    return { label: category.name, value: category.name };
  });

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    clearErrors([
      setNameError,
      setDescriptionError,
      setPriceError,
      setPerError,
      setSubcategoryError,
      setBrandError,
      setMadeInError,
      setDeliveryChargeError,
      setImagesError,
    ]);

    try {
      const formData = generateFormData({
        name,
        description,
        price,
        per,
        stockType,
        category,
        subCategory,
        deliveryCharge,
        brand,
        madeIn,
      });

      selectedFiles.forEach((selectedFile) => {
        formData.append("images", selectedFile);
      });

      const data = await fetcher("products", "POST", formData);

      console.log(data);
      router.push(`/products/${data.product.id}`);

      dispatch(setAlert({ message: "product added successfully" }));
    } catch (error) {
      console.log(error.message);
      if (error.message.includes("image") || error.message.includes("File")) {
        return setImagesError(error.message);
      }

      displayError(
        error.message,
        [
          "name",
          "description",
          "price",
          "per",
          "subCategory",
          "brand",
          "madeIn",
          "deliveryCharge",
        ],
        [
          setNameError,
          setDescriptionError,
          setPriceError,
          setPerError,
          setSubcategoryError,
          setBrandError,
          setMadeInError,
          setDeliveryChargeError,
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <Form heading="Add a product" onSubmit={handleFormSubmit}>
        <InputGroup
          label="product name"
          placeholder="min 5 chars, max 50 chars"
          value={name}
          error={nameError}
          onChange={setName}
        />

        <InputGroup
          label="product description"
          placeholder="min 50 chars, max 150 chars"
          view="textarea"
          minChars={50}
          maxChars={150}
          value={description}
          error={descriptionError}
          onChange={setDescription}
        />

        <div className="flex items-center space-x-3">
          <InputGroup
            label="price"
            value={price}
            view="number"
            min={0}
            error={priceError}
            step={0.01}
            onChange={setPrice}
          />

          <InputGroup
            label="per"
            placeholder="e.g. bottle or packet"
            value={per}
            error={perError}
            showRequired={false}
            className="flex-1"
            onChange={setPer}
          />
        </div>

        <InputGroup
          label="delivery charge"
          placeholder="leave empty for free shipping"
          view="number"
          min={0}
          showRequired={false}
          value={deliveryCharge}
          error={deliveryChargeError}
          onChange={setDeliveryCharge}
        />

        {authUser?.store?.storeType === "BUS" && (
          <InputGroup
            label="stock type"
            view="select"
            options={stockTypeOptions}
            value={stockType}
            info={<StockTypeInfo />}
            showRequired={false}
            onChange={setStockType}
          />
        )}

        <InputGroup
          label="product category"
          view="select"
          options={categoryOptions}
          showRequired={false}
          value={category}
          onChange={setCategory}
        />

        <InputGroup
          label="Subcategory"
          placeholder="e.g. phone for electronics"
          value={subCategory}
          error={subcategoryError}
          onChange={setSubcategory}
        />

        <FileSelector
          label="product images (up to 5 images, 3 mb each)"
          multiple
          max={5}
          isRequired={true}
          error={imagesError}
        />

        <InputGroup
          label="product brand"
          placeholder="max 30 chars"
          value={brand}
          error={brandError}
          showRequired={false}
          onChange={setBrand}
        />

        <InputGroup
          label="where was the product made ?"
          placeholder="max 30 chars"
          value={madeIn}
          error={madeInError}
          showRequired={false}
          onChange={setMadeIn}
        />

        <Button full loading={loading}>
          {loading ? "setting" : "set"} product
        </Button>
      </Form>
    </section>
  );
};

function StockTypeInfo() {
  const stockTypes = [
    {
      title: "flat",
      description: "Flat stock only has the quantity of a product.",
    },
    {
      title: "varied",
      description:
        "Varied stock defines different variations of a product based on attributes such as color, size, etc. Each variant type has its own values, for e.g. color may have red, blue. Quantity can be defined for each combination of variants.",
    },
  ];

  const InfoItem = ({ title, description }) => {
    return (
      <li className="mb-3">
        <h4 className="capitalize text-lg font-semibold black-white">
          {title}
        </h4>
        <p className="dark-light">{description}</p>
      </li>
    );
  };

  return (
    <div className="max-w-[300px]">
      <h3 className="heading-generic-modal">Product stock types</h3>

      <ul className="-mt-1">
        {stockTypes.map((stockType, index) => {
          return (
            <InfoItem
              title={stockType.title}
              description={stockType.description}
              key={index}
            />
          );
        })}
      </ul>
    </div>
  );
}

export default SetProduct;
