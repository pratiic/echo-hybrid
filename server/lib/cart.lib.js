export const getExisting = (cartItems, cartId) => {
    return cartItems.find((cartItem) => cartItem.cartId === cartId);
};
