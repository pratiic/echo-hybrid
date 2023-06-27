import prisma from "../lib/prisma.lib";

export const createAlertsInstances = async (request, response, next) => {
    try {
        await prisma.$transaction(async (prisma) => {
            const users = await prisma.user.findMany({
                where: {},
                select: {
                    id: true,
                    alerts: true,
                },
            });

            let userIds = []; // users for whom an alerts record needs to be created

            users.forEach((user) => {});
        });
    } catch (error) {
    } finally {
        await prisma.$disconnect();
    }
};
