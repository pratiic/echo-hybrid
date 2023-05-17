// util functions
export const getChatData = (chat) => {
    return {
        id: chat.id,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        unseenMsgsCounts: chat.unseenMsgsCounts,
        userIds: chat.userIds,
        users: chat.users.map((user) => {
            return { ...user.user };
        }),
    };
};
