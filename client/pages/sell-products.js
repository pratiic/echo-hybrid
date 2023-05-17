import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";

import { fetcher } from "../lib/fetcher";
import { updateAuthUser } from "../redux/slices/auth-slice";

import PageHeader from "../components/page-header";
import InfoBanner from "../components/info-banner";
import SellerCard from "../components/seller-card";
import Button from "../components/button";

const Sell = () => {
    const [type, setType] = useState("individual");
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const dispatch = useDispatch();
    const { authUser } = useSelector((state) => state.auth);

    useEffect(() => {
        // already registered as a seller -> redirect
        let route = "";

        if (authUser && authUser?.store) {
            if (authUser.store.storeType === "IND") {
                route = "/post-product";
            } else {
                route = "/business-registration/details";
            }

            router.push(route);
        }
    }, [authUser]);

    const handleButtonClick = async () => {
        setLoading(true);

        try {
            const data = await fetcher(
                `stores/?type=${type === "business" ? "BUS" : "IND"}`,
                "POST"
            );
            const { id, storeType } = data.store;

            dispatch(updateAuthUser({ store: { id, storeType } }));

            if (type === "business") {
                router.push("/business-registration/details");
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section>
            <PageHeader
                heading="Sell on Echo"
                hasBackArrow={true}
                isHeadingComponent
            />

            <InfoBanner liftUp={false} className="space-y-3">
                <p className="font-semibold">
                    There are two ways of selling products on Echo:
                </p>
                <p>
                    1. You may be an individual seller with no business and sell
                    second hand products with no stock or variation.
                </p>
                <p>
                    2. You may be a seller with a reigstered business and sell
                    new products with stocks and variations.
                </p>
                <p className="font-semibold">
                    Note that you may not change your seller orientation later.
                </p>
            </InfoBanner>

            <div className="flex space-x-7 my-7">
                <SellerCard
                    type="individual"
                    text="Sell as Individual"
                    isSelected={type === "individual"}
                    clickHandler={setType}
                />
                <SellerCard
                    type="business"
                    text="Sell as Business"
                    isSelected={type === "business"}
                    clickHandler={setType}
                />
            </div>

            <Button loading={loading} onClick={handleButtonClick}>
                continue
            </Button>
        </section>
    );
};

export default Sell;
