export const genericUserFields = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    avatar: true,
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
