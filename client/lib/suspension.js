export const getNotificationData = (
    action,
    targetType,
    targetId,
    product,
    store
) => {
    const notificationTextMap = {
        product: `your product with the Id of ${targetId} has been ${
            action === "suspend" ? "suspended" : "reinstated"
        }`,
        seller: `your seller profile has been ${
            action === "suspend" ? "suspended" : "reinstated"
        }`,
    };
    const destinationIdMap = {
        product: product?.store?.userId,
        seller: store?.userId,
    };
    const linkToMap = {
        product: `/products/${product?.id}`,
        seller: `/sellers/${store?.id}`,
    };

    return {
        text: `${notificationTextMap[targetType]}, check your email for further details`,
        destinationId: destinationIdMap[targetType],
        linkTo: linkToMap[targetType],
    };
};
