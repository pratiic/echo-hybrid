import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Head from "next/head";

import { checkDelivery } from "../lib/delivery";

import PageHeader from "../components/page-header";
import ContentList from "../components/content-list";
import InfoUnit from "../components/info-unit";
import OrderAll from "../components/order-all";

const Cart = () => {
    const [totalUnitPrice, setTotalUnitPrice] = useState(0);
    const [totalDeliveryCharge, setTotalDeliveryCharge] = useState(0);

    const { items, loading, error, needToFetch } = useSelector(
        (state) => state.cart
    );
    const { authUser } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        setTotalUnitPrice(
            items.reduce((prev, curr) => {
                return prev + curr?.product?.price * (curr?.quantity || 1);
            }, 0)
        );

        setTotalDeliveryCharge(
            items.reduce((prev, curr) => {
                const currDeliveryCharge = checkDelivery(
                    authUser?.address,
                    curr?.product?.isSecondHand
                        ? curr?.product?.store?.user?.address
                        : curr?.product?.store?.business?.address
                )
                    ? curr?.product?.deliveryCharge
                    : 0;
                return prev + currDeliveryCharge;
            }, 0)
        );
    }, [items]);

    return (
        <section>
            <Head>
                <title>Shopping cart ({items.length})</title>
            </Head>

            <PageHeader
                heading="shopping cart"
                hasBackArrow
                count={items.length}
            />

            {items.length > 0 && (
                <div className="mb-5">
                    <div className="mb-5 -mt-2 400:max-w-[300px]">
                        <InfoUnit
                            label="Total items"
                            value={items.length}
                            direction="row"
                            size="medium"
                        />

                        <InfoUnit
                            label="Total units"
                            value={items.reduce((prev, curr) => {
                                return prev + curr?.quantity || 1;
                            }, 0)}
                            direction="row"
                            size="medium"
                        />

                        <InfoUnit
                            label="Total unit price"
                            value={totalUnitPrice}
                            direction="row"
                            size="medium"
                            hasMoney={true}
                            toMoney={true}
                        />

                        <InfoUnit
                            label="Total delivery charge"
                            value={totalDeliveryCharge}
                            direction="row"
                            size="medium"
                            hasMoney={true}
                        />

                        <InfoUnit
                            label="Subtotal"
                            value={totalUnitPrice + totalDeliveryCharge}
                            direction="row"
                            size="medium"
                            hasMoney={true}
                            toMoney={true}
                        />
                    </div>

                    <OrderAll items={items} />
                </div>
            )}

            <ContentList
                list={items}
                type="cart-item"
                loadingMsg={loading && "Loading cart items..."}
                error={error}
                emptyMsg="There are no items in your shopping cart"
                human="no-items"
            />
        </section>
    );
};

export default Cart;
