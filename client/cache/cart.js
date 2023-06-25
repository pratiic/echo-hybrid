import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { setCartItems, setError, setLoading } from "../redux/slices/cart-slice";
import { fetcher } from "../lib/fetcher";

const Cart = () => {
    const { needToFetch } = useSelector((state) => state.cart);
    const { authUser } = useSelector((state) => state.auth);

    const dispatch = useDispatch();

    useEffect(() => {
        if (authUser && needToFetch) {
            fetchCartItems();
        }
    }, [authUser, needToFetch]);

    const fetchCartItems = async () => {
        dispatch(setLoading(true));

        try {
            const data = await fetcher("carts");

            dispatch(setCartItems(data.items));
        } catch (error) {
            dispatch(setError(error.message));
        } finally {
            dispatch(setLoading(false));
        }
    };

    return <></>;
};

export default Cart;
