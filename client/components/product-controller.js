import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";

import { fetcher } from "../lib/fetcher";
import { setErrorAlert } from "../redux/slices/alerts-slice";
import {
    closeModal,
    showGenericModal,
    showLoadingModal,
} from "../redux/slices/modal-slice";

import Button from "./button";
import OrderDetails from "./order-details";
import { addCartItem } from "../redux/slices/cart-slice";

const ProductControl = ({
    quantity,
    variantId,
    variant,
    productId,
    canAddToCart = true,
    product,
}) => {
    const { activeProduct } = useSelector((state) => state.products);
    const dispatch = useDispatch();
    const router = useRouter();

    const handleOrderClick = () => {
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

            const data = await fetcher(`carts/items`, "POST", {
                productId,
                variantId,
                quantity,
            });
            dispatch(addCartItem(data.item));

            router.push("/cart");
        } catch (error) {
            dispatch(setErrorAlert(error.message));
        } finally {
            dispatch(closeModal());
        }
    };

    return (
        <div className="flex items-center mt-3">
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
