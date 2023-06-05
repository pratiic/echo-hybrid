export const genericUserFields = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    avatar: true,
    isAdmin: true,
    isDeliveryPersonnel: true,
    fullName: true,
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
