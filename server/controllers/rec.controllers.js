import { createObjectCsvWriter } from "csv-writer";

import prisma from "../lib/prisma.lib.js";
import { HttpError } from "../models/http-error.models.js";

export const exportRecDataset = async (request, response, next) => {
    try {
        // const [searchHistory, orderHistory, products] = await Promise.all([
        //     prisma.search.findMany({}),
        //     prisma.order.findMany({}),
        //     prisma.product.findMany({}),
        // ]);
        const orderHistory = await prisma.order.findMany({});

        const interactions = orderHistory.map((order) => {
            return {
                userId: order.originId,
                itemId: order.productId,
                interactionStrength: order.quantity || 1,
            };
        });

        const csvFilePath = "data-set.csv";
        const csvWriter = createObjectCsvWriter({
            path: csvFilePath,
            header: [
                { id: "userId", title: "userId" },
                { id: "itemId", title: "itemId" },
                { id: "interactionStrength", title: "interactionStrength" },
            ],
        });

        const csvRecords = interactions.map((interaction) => ({
            userId: interaction.userId,
            itemId: interaction.itemId,
            interactionStrength: interaction.interactionStrength,
        }));

        await csvWriter.writeRecords(csvRecords);

        response.json({});
    } catch (error) {
        console.log(error);
        next(new HttpError());
    }
};
