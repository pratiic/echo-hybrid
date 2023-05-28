import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TrashIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";

import { addCommas } from "../lib/strings";
import { getSubtotal } from "../lib/order";
import {
    closeModal,
    showConfirmationModal,
    showLoadingModal,
} from "../redux/slices/modal-slice";
import { fetcher } from "../lib/fetcher";
import { setAlert, setErrorAlert } from "../redux/slices/alerts-slice";
import { deleteCartItem, updateCartItem } from "../redux/slices/cart-slice";
import { checkDelivery } from "../lib/delivery";

import OrderHead from "./order-head";
import InfoUnit from "./info-unit";
import CountController from "./count-controller";
import Icon from "./icon";
import ProductControl from "./product-control";

const CartItem = ({ id, product, variant, quantity }) => {
    const [maxQuantity, setMaxQuantity] = useState(0);
    const [isDelivered, setIsDelivered] = useState(false);

    const dispatch = useDispatch();
    const router = useRouter();
    const { authUser } = useSelector((state) => state.auth);

    useEffect(() => {
        setMaxQuantity(
            parseInt(variant ? variant?.quantity : product?.stock?.quantity)
        );
    }, [product?.stock, variant]);

    useEffect(() => {
        if (parseInt(quantity) === 0) {
            dispatch(deleteCartItem(id));
        }
    }, [quantity]);

    useEffect(() => {
        setIsDelivered(
            checkDelivery(
                authUser?.address,
                product?.isSecondHand
                    ? product?.user?.address
                    : product?.store?.business?.address
            )
        );
    }, [authUser, product]);

    const handleQuantityChange = async (quantity) => {
        dispatch(showLoadingModal("updating cart item..."));

        try {
            const data = await fetcher(`carts/${product?.id}`, "POST", {
                productId: product?.id,
                variantId: variant?.id,
                quantity: quantity,
            });

            dispatch(updateCartItem({ id, updateInfo: data.item }));
        } catch (error) {
            dispatch(setErrorAlert(error.message));
        } finally {
            dispatch(closeModal());
        }
    };

    const handleCartItemDeletion = async (id) => {
        try {
            dispatch(showLoadingModal("Removing cart item..."));
            await fetcher(`carts/${id}`, "DELETE");
            dispatch(deleteCartItem(id));
            dispatch(
                setAlert({
                    message: "item has been removed from your cart",
                })
            );
        } catch (error) {
            dispatch(setErrorAlert(error.message));
        } finally {
            dispatch(closeModal());
        }
    };

    const handleDeleteClick = () => {
        dispatch(
            showConfirmationModal({
                message:
                    "are you sure you want to remove this item from your cart ?",
                handler: () => handleCartItemDeletion(id),
            })
        );
    };

    const handleItemClick = () => {
        router.push(`/products/${product.id}`);
    };

    return (
        <div className="flex flex-col 600:flex-row mb-7 relative w-fit border-b border-faint pb-1">
            <div className="flex flex-col">
                <div className="cursor-pointer" onClick={handleItemClick}>
                    <OrderHead {...{ product, variant, quantity }} />
                </div>

                <div className="mt-3">
                    <div className="flex flex-wrap items-center justify-between mb-1">
                        <InfoUnit label="item Id" value={`# ${id}`} />

                        <InfoUnit
                            label="unit price"
                            value={addCommas(product?.price)}
                            hasMoney={true}
                        />

                        <InfoUnit
                            label="delivery"
                            value={
                                !authUser?.address
                                    ? "address not set"
                                    : isDelivered
                                    ? "available"
                                    : "not available"
                            }
                        />

                        {isDelivered && (
                            <InfoUnit
                                label="delivery charge"
                                value={product?.deliveryCharge}
                                hasMoney
                            />
                        )}
                    </div>

                    <InfoUnit
                        label="subtotal"
                        hasMoney={true}
                        value={getSubtotal(
                            product?.price,
                            quantity,
                            product?.deliveryCharge
                        )}
                        highlight
                    />
                </div>
            </div>

            {!product?.isSecondHand && (
                <div className="mt-3 600:mt-0 600:ml-14">
                    {/* quantity controller */}
                    <div>
                        <span className="block mb-3 dark-light">Quantity</span>

                        <CountController
                            count={quantity}
                            max={maxQuantity}
                            userCanBuy={true}
                            setCount={handleQuantityChange}
                        />

                        <span className="text-sm dark-light block my-3">
                            {maxQuantity > 0
                                ? `${maxQuantity} items remaining`
                                : "Out of stock"}
                        </span>
                    </div>

                    {/* cannot order if quantity is greater than max */}
                    {quantity <= maxQuantity && quantity >= 1 && (
                        <ProductControl
                            quantity={quantity}
                            variant={variant}
                            variantId={variant?.id}
                            productId={product?.id}
                            canAddToCart={false}
                            product={product}
                        />
                    )}
                </div>
            )}

            <div className="absolute bottom-1 right-0">
                <Icon onClick={handleDeleteClick}>
                    <TrashIcon className="icon-small" />
                </Icon>
            </div>
        </div>
    );
};

export default CartItem;
