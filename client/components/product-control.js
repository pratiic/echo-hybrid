// 1. allows ordering a product or a variation
// 2. allows adding a product to the cart

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";

import { fetcher } from "../lib/fetcher";
import { setAlert, setErrorAlert } from "../redux/slices/alerts-slice";
import {
    closeModal,
    showGenericModal,
    showLoadingModal,
} from "../redux/slices/modal-slice";
import { addCartItem } from "../redux/slices/cart-slice";

import Button from "./button";
// import OrderDetails from "./order-details";

const ProductControl = ({
    quantity,
    variantId,
    variant,
    productId,
    canAddToCart = true,
    product,
    isSecondHand,
    className,
}) => {
    const { activeProduct } = useSelector((state) => state.products);
    const dispatch = useDispatch();
    const router = useRouter();

    const handleOrderClick = () => {
        // dispatch(
        //     showGenericModal(
        //         <OrderDetails
        //             quantity={quantity}
        //             variant={variant}
        //             variantId={variantId}
        //             product={product || activeProduct}
        //         />
        //     )
        // );
    };

    const handleCartClick = async () => {
        try {
            dispatch(showLoadingModal("adding item to your cart..."));

            const data = await fetcher(`carts/${productId}`, "POST", {
                variantId,
                quantity,
            });
            dispatch(addCartItem(data.item));

            router.push("/cart");
        } catch (error) {
            if (error.message.includes("already exists")) {
                return dispatch(
                    setAlert({ type: "info", message: error.message })
                );
            }

            dispatch(setErrorAlert(error.message));
        } finally {
            dispatch(closeModal());
        }
    };

    return (
        <div className={`flex items-center mt-3 ${className}`}>
            <div className={canAddToCart && "mr-3"}>
                <Button small={!canAddToCart} onClick={handleOrderClick}>
                    order now
                </Button>
            </div>

            {canAddToCart && (
                <Button type="secondary" onClick={handleCartClick}>
                    add to cart
                </Button>
            )}
        </div>
    );
};

export default ProductControl;
