import { capitalizeAll, capitalizeFirstLetter } from "./strings";

const targetStrMap = {
    product: "product",
    store: "seller",
};

export const getCommentNotificationData = (
    commentUser,
    targetType,
    targetId,
    targetName,
    targetUserId,
    baseCommentId,
    baseCommentUserId,
    isTargetBusiness
) => {
    const { firstName, lastName } = commentUser;
    let notificationText = `${capitalizeAll(`${firstName} ${lastName}`)} `;

    const targetIdMap = {
        product: targetId,
        store: targetUserId,
    };

    let destinationId = null,
        linkTo = `/${targetStrMap[targetType]}s/${targetId}`;

    if (baseCommentId) {
        // reply to a review
        if (baseCommentId === commentUser?.id) {
            return;
        }

        notificationText += `replied to your review`;
        destinationId = baseCommentUserId;
    } else {
        if (targetType === "store") {
            // review of a seller
            notificationText += `provided a review of ${
                isTargetBusiness ? "your business" : "you"
            }`;
        } else {
            notificationText += `reviewed your product - ${capitalizeFirstLetter(
                targetName
            )}`;
        }

        destinationId = targetUserId;
    }

    return {
        text: notificationText,
        destinationId,
        linkTo,
    };
};

export const getRatingNotificationData = (
    ratingUser,
    rating,
    targetType,
    targetId,
    targetName,
    targetUserId,
    isTargetBusiness
) => {
    const { firstName, lastName } = ratingUser;
    let notificationText = `${capitalizeAll(
        `${firstName} ${lastName}`
    )} gave a rating of ${rating} to `;
    notificationText +=
        targetType === "product"
            ? `your product - ${targetName}`
            : `${isTargetBusiness ? "your business" : "you"}`;
    const destinationId = targetUserId;
    const linkTo = `/${targetStrMap[targetType]}s/${targetId}`;

    return {
        text: notificationText,
        destinationId,
        linkTo,
    };
};
