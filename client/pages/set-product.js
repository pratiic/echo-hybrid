import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

import { clearErrors, displayError } from "../lib/validation";
import { generateFormData } from "../lib/form-data";
import { fetcher } from "../lib/fetcher";
import { setAlert, setErrorAlert } from "../redux/slices/alerts-slice";
import { updateProduct } from "../redux/slices/products-slice";
import { showGenericModal } from "../redux/slices/modal-slice";

import Form from "../components/form";
import InputGroup from "../components/input-group";
import Button from "../components/button";
import FileSelector from "../components/file-selector";
import StockInfo from "../components/stock-info";

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
    const [mode, setMode] = useState("");

    const { categories } = useSelector((state) => state.categories);
    const { authUser } = useSelector((state) => state.auth);
    const { selectedFiles } = useSelector((state) => state.files);
    const { activeProduct } = useSelector((state) => state.products);

    const router = useRouter();
    const dispatch = useDispatch();

    useEffect(() => {
        const store = authUser?.store;

        // redirect if user has not registered as a seller
        if (!store) {
            router.push("/sell-products");
        }

        if (store?.storeType === "IND" && !authUser?.address) {
            dispatch(
                setAlert({
                    type: "info",
                    message: "you need to set your address first",
                })
            );
            router.push("/profile/?show=address&redirect=set-product");
        }

        // redirect if business has not been registered and verified
        if (store?.storeType === "BUS") {
            if (!store?.business || !store?.business?.isVerified) {
                router.push("/business-registration");
            }
        }

        // redirect if user address is not set
    }, [authUser]);

    useEffect(() => {
        setMode(router.query?.mode || "create");
    }, [router]);

    useEffect(() => {
        if (mode === "update" && !activeProduct) {
            router.push("/set-product/?mode=create");
        }

        if (mode === "update" && activeProduct) {
            const {
                name,
                description,
                price,
                per,
                deliveryCharge,
                brand,
                madeIn,
            } = activeProduct;

            setName(name);
            setDescription(description);
            setPrice(price);
            setPer(per);
            setDeliveryCharge(deliveryCharge);
            setBrand(brand);
            setMadeIn(madeIn);
        }
    }, [mode, activeProduct]);

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
            let dataToSend = null;
            const url =
                mode === "create"
                    ? "products"
                    : `products/${activeProduct?.id}`;

            if (mode === "create") {
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

                dataToSend = formData;
            } else {
                dataToSend = {
                    name,
                    description,
                    price,
                    per,
                    deliveryCharge,
                    brand,
                    madeIn,
                };
            }

            const data = await fetcher(
                url,
                mode === "create" ? "POST" : "PATCH",
                dataToSend
            );

            if (mode === "update") {
                dispatch(updateProduct(data.product));
            }

            dispatch(
                setAlert({
                    message: `product ${
                        mode === "create" ? "added" : "updated"
                    } successfully`,
                })
            );
            router.push(`/products/${data.product.id}`);
        } catch (error) {
            if (error.statusCode === 401) {
                return dispatch(setErrorAlert(error.message));
            }

            dispatch(setErrorAlert("view the fields for error"));

            if (
                error.message.includes("image") ||
                error.message.includes("File")
            ) {
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

    const getHeading = () => {
        return mode === "create" ? "Add a product" : "Update product";
    };

    return (
        <section>
            <Head>
                <title>{getHeading()}</title>
            </Head>

            <Form heading={getHeading()} onSubmit={handleFormSubmit}>
                <InputGroup
                    label="product name"
                    placeholder="min 5 chars, max 100 chars"
                    value={name}
                    error={nameError}
                    onChange={setName}
                />

                <InputGroup
                    label="product description"
                    placeholder="min 50 chars, max 200 chars"
                    view="textarea"
                    minChars={50}
                    maxChars={200}
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
                    view="number"
                    min={0}
                    value={deliveryCharge}
                    error={deliveryChargeError}
                    onChange={setDeliveryCharge}
                />

                {mode === "create" && (
                    // cannot update these fields
                    <React.Fragment>
                        {authUser?.store?.storeType === "BUS" && (
                            <InputGroup
                                label="stock type"
                                view="select"
                                options={stockTypeOptions}
                                value={stockType}
                                info={<StockInfo />}
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
                    </React.Fragment>
                )}

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

                <Button full loading={loading} rounded={false}>
                    {loading
                        ? mode === "create"
                            ? "adding"
                            : "updating"
                        : mode === "create"
                        ? "add"
                        : "update"}{" "}
                    product
                </Button>
            </Form>
        </section>
    );
};

export default SetProduct;
