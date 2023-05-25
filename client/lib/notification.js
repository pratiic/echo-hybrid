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
    baseCommentUserId
) => {
    const { firstName, lastName } = commentUser;
    let notificationText = `${capitalizeAll(`${firstName} ${lastName}`)} `;

    const targetIdMap = {
        product: targetId,
        store: targetUserId,
    };

    let destinationId = null,
        linkTo = `/${targetStrMap[targetType]}s/${targetIdMap[targetType]}`;

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
            notificationText += "provided a review of you";
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
    targetUserId
) => {
    const { firstName, lastName } = ratingUser;
    let notificationText = `${capitalizeAll(
        `${firstName} ${lastName}`
    )} gave a rating of ${rating} to `;
    notificationText +=
        targetType === "product" ? `your product - ${targetName}` : "you";

    const targetIdMap = {
        product: targetId,
        store: targetUserId,
    };

    const destinationId = targetUserId;

    const linkTo = `/${targetStrMap[targetType]}s/${targetIdMap[targetType]}`;

    return {
        text: notificationText,
        destinationId,
        linkTo,
    };
};
