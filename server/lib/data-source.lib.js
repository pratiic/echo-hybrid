export const genericUserFields = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    avatar: true,
    isAdmin: true,
    isDeliveryPersonnel: true,
    isVerified: true,
    fullName: true,
    createdAt: true,
};

export const extraUserFields = {
    store: {
        select: {
            id: true,
            storeType: true,
            business: {
                select: {
                    id: true,
                    isVerified: true,
                },
            },
        },
    },
    address: true,
};

export const productDeletionFields = {
    storeId: null,
    isDeleted: true,
    categoryName: null,
};

export const transactionSelectionFields = {
    id: true,
    order: {
        select: {
            id: true,
            consumerAddress: true,
            unitPrice: true,
            isDelivered: true,
            deliveryCharge: true,
            originId: true,
            product: {
                select: {
                    id: true,
                    name: true,
                    images: true,
                    isSecondHand: true,
                },
            },
            store: {
                select: {
                    id: true,
                    user: {
                        select: {
                            id: true,
                            address: true,
                            fullName: true,
                        },
                    },
                    business: {
                        select: {
                            id: true,
                            name: true,
                            address: true,
                        },
                    },
                    storeType: true,
                },
            },
            origin: true,
            quantity: true,
            variant: true,
            createdAt: true,
        },
    },
    isAcknowledged: true,
    createdMonth: true,
    createdYear: true,
    createdAt: true,
};

export const deliveryInclusionFields = {
    order: {
        include: {
            product: true,
        },
    },
    madeBy: {
        select: genericUserFields,
    },
};

export const orderInclusionFields = {
    origin: {
        select: genericUserFields,
    },
    product: true,
    store: {
        include: {
            user: {
                select: { ...genericUserFields, address: true },
            },
            business: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    },
    orderCompletion: true,
};

export const businessInclusionFields = {
    store: {
        select: {
            id: true,
            user: {
                select: genericUserFields,
            },
        },
    },
    address: true,
};

export const reportInclusionFields = {
    product: {
        select: {
            id: true,
        },
    },
    store: {
        select: {
            id: true,
        },
    },
    user: {
        select: {
            id: true,
        },
    },
    review: {
        select: {
            id: true,
            text: true,
            image: true,
            userId: true,
            productId: true,
            storeId: true,
        },
    },
    creator: {
        select: genericUserFields,
    },
};

export const suspensionInclusionFields = {
    product: {
        select: {
            id: true,
            store: {
                select: {
                    userId: true,
                },
            },
        },
    },
    store: {
        select: {
            id: true,
            userId: true,
        },
    },
    user: {
        select: {
            id: true,
        },
    },
};
