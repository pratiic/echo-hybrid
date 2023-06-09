import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";

import { getSubtotal } from "../lib/order";
import { addCommas, capitalizeFirstLetter } from "../lib/strings";
import { setAlert } from "../redux/slices/alerts-slice";
import { closeModal } from "../redux/slices/modal-slice";
import { deleteCartItem } from "../redux/slices/cart-slice";
import { fetcher } from "../lib/fetcher";
import { checkDelivery } from "../lib/delivery";
import { addUserOrder } from "../redux/slices/orders-slice";

import Button from "./button";
import DeliveryInfo from "./delivery-info";
import AddressSetter from "./address-setter";
import Tag from "./tag";

const OrderDetails = ({ quantity, variant, variantId, product }) => {
    const [placingOrder, setPlacingOrder] = useState(false);
    const [error, setError] = useState("");
    const [deliveryAddress, setDeliveryAddress] = useState(null);
    const [isUserAddress, setIsUserAddress] = useState(true);
    const [sellerAddr, setSellerAddr] = useState("");
    const [isDelivered, setIsDelivered] = useState(false);

    const { authUser } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const router = useRouter();

    useEffect(() => {
        setSellerAddr(
            product?.isSecondHand
                ? product?.store?.user?.address
                : product?.store?.business?.address
        );
    }, [product]);

    useEffect(() => {
        setIsDelivered(
            checkDelivery(
                isUserAddress ? authUser?.address : deliveryAddress,
                sellerAddr
            )
        );
    }, [isUserAddress, authUser, deliveryAddress, sellerAddr]);

    const placeOrder = async (address) => {
        try {
            setPlacingOrder(true);
            setError("");

            const orderData = {
                quantity,
                variantId,
            };

            if (isDelivered) {
                orderData.address = address;
            }

            const data = await fetcher(
                `orders/${product.id}`,
                "POST",
                orderData
            );

            dispatch(addUserOrder(data.order));
            dispatch(
                setAlert({
                    message: "Your order has been placed",
                    type: "success",
                })
            );
            dispatch(closeModal());

            if (data.cartItemId) {
                dispatch(deleteCartItem(data.cartItemId));
            }

            router.push("/orders/?show=user");
        } catch (error) {
            setError(error.message);
        } finally {
            setPlacingOrder(false);
        }
    };

    const handleContinueClick = () => {
        let orderDeliveryAddress;

        if (isUserAddress) {
            if (!authUser?.address) {
                dispatch(
                    setAlert({
                        message: "you need to set your address first",
                        type: "info",
                    })
                );
                dispatch(closeModal());
                return router.push(
                    `/profile/?show=address&redirect=${router?.asPath}`
                );
            }

            const { province, city, area, description } = authUser?.address;
            orderDeliveryAddress = { province, city, area, description };
        } else {
            orderDeliveryAddress = deliveryAddress;
        }

        placeOrder(orderDeliveryAddress);
    };

    const onAddressChange = (address, isUserAddress) => {
        setDeliveryAddress(address);
        setIsUserAddress(isUserAddress);
    };

    return (
        <div>
            <h3 className="heading-generic-modal">Order details</h3>

            <div className="flex space-x-5 600:space-x-11 mb-3 -mt-2">
                <div className="black-white">
                    {/* product name */}
                    <h4 className="text-xl font-semibold max-w-[200px]">
                        {capitalizeFirstLetter(product?.name)}
                    </h4>

                    {/* quantity */}
                    {!product?.isSecondHand && <span>x {quantity}</span>}

                    {product?.isSecondHand && <Tag text="second hand" />}

                    {/* variant */}
                    {variant && (
                        <div>
                            {Object.keys(variant).map((key, i) => {
                                if (key !== "id" && key !== "quantity") {
                                    return (
                                        <p key={i}>
                                            <span className="dark-light capitalize text-xs">
                                                {key}
                                            </span>
                                            <span className="uppercase text-blue-three font-semibold text-sm ml-1">
                                                {variant[key]}
                                            </span>
                                        </p>
                                    );
                                }
                            })}
                        </div>
                    )}
                </div>

                {/* price and delivery info */}
                <div className="max-w-[15rem] text-sm">
                    <p className="font-semibold text-blue-three text-lg mb-2">
                        Rs. {addCommas(product?.price)}
                    </p>
                </div>
            </div>

            <div className="space-y-2 mb-3">
                {/* delivery address */}
                <AddressSetter onAddressChange={onAddressChange} />

                {/* delivery info */}
                <div className="text-sm -ml-1">
                    <DeliveryInfo
                        consumerAddr={
                            isUserAddress ? authUser?.address : deliveryAddress
                        }
                        sellerAddr={sellerAddr}
                        deliveryCharge={product?.deliveryCharge}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between">
                {/* subtotal */}
                <div className="flex flex-col">
                    <span className="black-white">Subtotal</span>
                    <span className="font-semibold text-blue-three text-xl">
                        Rs.{" "}
                        {getSubtotal(
                            product?.price,
                            quantity,
                            product?.deliveryCharge,
                            true,
                            isDelivered
                        )}
                    </span>
                </div>

                <Button
                    small
                    loading={placingOrder}
                    onClick={handleContinueClick}
                >
                    {placingOrder ? "placing order" : "continue"}
                </Button>
            </div>

            {error && (
                <p className="error mt-1">{capitalizeFirstLetter(error)}</p>
            )}
        </div>
    );
};

export default OrderDetails;
