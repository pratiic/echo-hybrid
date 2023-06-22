import { createObjectCsvWriter } from "csv-writer";
import path from "path";
import os from "os";

import prisma from "../lib/prisma.lib.js";
import { HttpError } from "../models/http-error.models.js";

export const exportRecDataset = async (request, response, next) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                isDeleted: false,
                NOT: {
                    name: "new product",
                },
            },
        });

        const orders = await prisma.order.findMany({
            where: {
                isDeleted: false,
            },
        });

        // const fileName = "data-set.csv";
        // const destinationPath = path.join(
        //   os.homedir(),
        //   "Desktop",
        //   "product-recommendation"
        // );
        // const csvFilePath = path.join(destinationPath, fileName);
        const csvWriter = createObjectCsvWriter({
            path: "similarity-data-set.csv",
            header: [
                { id: "id", title: "id" },
                { id: "name", title: "name" },
                { id: "categoryName", title: "categoryName" },
                { id: "subCategory", title: "subCategory" },
                { id: "brand", title: "brand" },
                { id: "price", title: "price" },
            ],
        });

        const csvRecords = products.map((product) => ({
            id: product.id,
            name: product.name,
            categoryName: product.categoryName,
            subCategory: product.subCategory,
            brand: product.brand,
            price: product.price,
        }));

        await csvWriter.writeRecords(csvRecords);

        response.json({});
    } catch (error) {
        console.log(error);
        next(new HttpError());
    }
};
