import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { showGenericModal } from "../redux/slices/modal-slice";

import InfoBanner from "./info-banner";
import Button from "./button";
import PrimaryInfo from "./product-info/primary";
import SecondaryInfo from "./product-info/secondary";

const ProductInfo = ({
    store,
    name,
    price,
    per,
    images,
    description,
    rating,
    brand,
    deliveryCharge,
    madeIn,
    stock,
    stockType,
    variationTypes,
    createdAt,
    isSecondHand,
    isMyProduct,
}) => {
    const [secondaryProps, setSecondaryProps] = useState({});
    const dispatch = useDispatch();

    useEffect(() => {
        setSecondaryProps({
            store,
            deliveryCharge,
            madeIn,
            isSecondHand,
            isMyProduct,
            createdAt,
        });
    }, [store, deliveryCharge, madeIn, isSecondHand, isMyProduct, createdAt]);

    const toggleSecondaryInfo = () => {
        dispatch(showGenericModal(<SecondaryInfo {...secondaryProps} />));
    };

    const handleSetStockClick = () => {};

    return (
        <div>
            {/* if stock has not been set, show an alert */}
            {isMyProduct && !stock && (
                <InfoBanner>
                    <p className="mb-1">
                        This product is not active yet because stock has not
                        been set
                    </p>
                    <Button small onClick={handleSetStockClick}>
                        set stock
                    </Button>
                </InfoBanner>
            )}

            <div className="flex">
                <PrimaryInfo
                    isMyProduct={isMyProduct}
                    {...{
                        store,
                        name,
                        price,
                        per,
                        images,
                        description,
                        rating,
                        brand,
                        toggleSecondaryInfo,
                        stock,
                        stockType,
                        variationTypes,
                    }}
                />

                <div className="ml-auto hidden 1200:block">
                    <SecondaryInfo {...secondaryProps} />
                </div>
            </div>
        </div>
    );
};

export default ProductInfo;
