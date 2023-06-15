// 1. allows ordering a product or a variation
// 2. allows adding a product to the cart

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";

import { fetcher } from "../lib/fetcher";
import { setAlert, setErrorAlert } from "../redux/slices/alerts-slice";
import {
    closeModal,
    showGenericModal,
    showLoadingModal,
} from "../redux/slices/modal-slice";
import { addCartItem, updateCartItem } from "../redux/slices/cart-slice";

import Button from "./button";
import OrderDetails from "./order-details";

const ProductControl = ({
    quantity,
    variantId,
    variant,
    productId,
    canAddToCart = true,
    product,
    className,
}) => {
    const [isRestricted, setIsRestricted] = useState(false);

    const { activeProduct } = useSelector((state) => state.products);
    const { authUser } = useSelector((state) => state.auth);

    const dispatch = useDispatch();
    const router = useRouter();

    useEffect(() => {
        setIsRestricted(authUser?.isAdmin || authUser?.isDeliveryPersonnel);
    }, [authUser]);

    const handleOrderClick = (event) => {
        event.stopPropagation();

        dispatch(
            showGenericModal(
                <OrderDetails
                    quantity={quantity}
                    variant={variant}
                    variantId={variantId}
                    product={product || activeProduct}
                />
            )
        );
    };

    const handleCartClick = async () => {
        try {
            dispatch(showLoadingModal("adding item to your cart..."));

            const data = await fetcher(`carts/${productId}`, "POST", {
                variantId,
                quantity,
            });
            dispatch(addCartItem(data.item));
            dispatch(
                updateCartItem({
                    id: data.item.id,
                    stock: data.item.product.stock,
                    quantity: data.item.quantity,
                })
            );
            router.push("/cart");
        } catch (error) {
            if (error.message.includes("already exists")) {
                dispatch(setAlert({ type: "info", message: error.message }));
                return router.push("/cart");
            }

            dispatch(setErrorAlert(error.message));
        } finally {
            dispatch(closeModal());
        }
    };

    if (isRestricted) {
        return (
            <p className="restricted-msg mt-1">
                you are not allowed to buy products
            </p>
        );
    }

    return (
        <div className={`flex items-center mt-3 ${className}`}>
            <div className={canAddToCart && "mr-3"}>
                <Button small onClick={handleOrderClick}>
                    order now
                </Button>
            </div>

            {canAddToCart && (
                <Button
                    type="secondary"
                    small
                    textAsIs
                    onClick={handleCartClick}
                >
                    Add to Cart
                </Button>
            )}
        </div>
    );
};

export default ProductControl;
