import { createObjectCsvWriter } from "csv-writer";
import path from "path";
import os from "os";

import prisma from "../lib/prisma.lib.js";
import { HttpError } from "../models/http-error.models.js";

export const exportRecDataset = async (request, response, next) => {
    try {
        const productSelectionFields = {
            id: true,
            name: true,
            categoryName: true,
            subCategory: true,
            brand: true,
        };

        const products = await prisma.product.findMany({
            where: {
                isDeleted: false,
                NOT: {
                    name: "new product",
                },
            },
            select: productSelectionFields,
        });

        const orders = await prisma.order.findMany({
            where: {
                product: {
                    isDeleted: false,
                },
            },
            select: {
                id: true,
                originId: true,
                product: {
                    select: productSelectionFields,
                },
            },
        });

        // const fileName = "data-set.csv";
        // const destinationPath = path.join(
        //   os.homedir(),
        //   "Desktop",
        //   "product-recommendation"
        // );
        // const csvFilePath = path.join(destinationPath, fileName);
        const productFieldsArr = [
            { id: "id", title: "id" },
            { id: "name", title: "name" },
            { id: "categoryName", title: "categoryName" },
            { id: "subCategory", title: "subCategory" },
            { id: "brand", title: "brand" },
        ];

        const similarityWriter = createObjectCsvWriter({
            path: "similarity-data-set.csv",
            header: productFieldsArr,
        });
        const recommendationWriter = createObjectCsvWriter({
            path: "recommendation-data-set.csv",
            header: [
                ...productFieldsArr,
                {
                    id: "userId",
                    title: "userId",
                },
                {
                    id: "orderId",
                    title: "orderId",
                },
            ],
        });

        const similarityRecords = products.map((product) => ({
            id: product.id,
            name: product.name,
            categoryName: product.categoryName,
            subCategory: product.subCategory,
            brand: product.brand,
        }));
        const recommendationRecords = orders.map((order) => {
            return {
                id: order.product.id,
                name: order.product.name,
                categoryName: order.product.categoryName,
                subCategory: order.product.subCategory,
                brand: order.product.brand,
                price: order.product.price,
                orderId: order.id,
                userId: order.originId,
            };
        });

        await Promise.all([
            similarityWriter.writeRecords(similarityRecords),
            recommendationWriter.writeRecords(recommendationRecords),
        ]);

        response.json({});
    } catch (error) {
        console.log(error);
        next(new HttpError());
    }
};
