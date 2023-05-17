import React from "react";
import { useSelector } from "react-redux";
import { useState } from "react";
import { useRouter } from "next/router";

import { clearErrors, displayError } from "../lib/validation";
import { generateFormData } from "../lib/form-data";
import { fetcher } from "../lib/fetcher";

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

    const stockTypeOptions = [
        { label: "flat", value: "flat" },
        { label: "varied", value: "varied" },
    ];
    const categoryOptions = [
        categories.map((category) => {
            return { label: category.name, value: category.name };
        }),
    ];

    const handleFormSubmit = (event) => {
        event.preventDefault();

        console.log("click");
    };

    return (
        <section>
            <Form heading="Set Product" onSubmit={handleFormSubmit}>
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

                    <div className="flex-1">
                        <InputGroup
                            label="per"
                            placeholder="e.g. bottle or packet"
                            value={per}
                            error={perError}
                            showRequired={false}
                            onChange={setPer}
                        />
                    </div>
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
                <React.Fragment>
                    <InputGroup
                        label="stock type"
                        view="select"
                        options={stockTypeOptions}
                        value={stockType}
                        info={<StockTypeInfo />}
                        showRequired={false}
                        onChange={setStockType}
                    />

                    <InputGroup
                        label="product category"
                        view="select"
                        options={categoryOptions[0]}
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
                </React.Fragment>
                )}
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
                <h4 className="capitalize text-lg font-semibold text-t-black">
                    {title}
                </h4>
                <p className="text-gray-700">{description}</p>
            </li>
        );
    };

    return (
        <div className="max-w-[300px]">
            <h3 className="heading-generic-modal">Product stock types</h3>

            <ul className="-mt-2">
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
