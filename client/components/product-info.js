import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";

import { showGenericModal } from "../redux/slices/modal-slice";

import InfoBanner from "./info-banner";
import Button from "./button";
import PrimaryInfo from "./product-info/primary";
import SecondaryInfo from "./product-info/secondary";
import StockSetter from "./stock-setter";

const ProductInfo = ({
    id,
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
    variations,
    createdAt,
    isSecondHand,
    isMyProduct,
    hasBeenSold,
    warranty,
}) => {
    const [secondaryProps, setSecondaryProps] = useState({});
    const dispatch = useDispatch();

    useEffect(() => {
        setSecondaryProps({
            name,
            store,
            deliveryCharge,
            madeIn,
            isSecondHand,
            isMyProduct,
            brand,
            warranty,
            createdAt,
        });
    }, [
        name,
        store,
        deliveryCharge,
        madeIn,
        isSecondHand,
        isMyProduct,
        brand,
        warranty,
        createdAt,
    ]);

    const toggleSecondaryInfo = () => {
        dispatch(
            showGenericModal(
                <SecondaryInfo {...secondaryProps} showName={true} />
            )
        );
    };

    const handleSetStockClick = () => {
        dispatch(
            showGenericModal(
                <StockSetter
                    productId={id}
                    stockType={stockType}
                    variations={variations}
                />
            )
        );
    };

    return (
        <div>
            {/* if stock has not been set, show an alert */}
            {isMyProduct && !stock && !isSecondHand && (
                <InfoBanner>
                    <p className="mb-2">
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
                        id,
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
                        variations,
                        isSecondHand,
                        isMyProduct,
                        hasBeenSold,
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
