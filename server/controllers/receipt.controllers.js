import puppeteer from "puppeteer";
import fs from "fs";

import { HttpError } from "../models/http-error.models.js";

export const generateReceipt = async (request, response, next) => {
    // Fetch necessary data from your database or request body
    const sellerName = "John Doe";
    const orderDetails = "Order details";
    const deliveryInfo = "Delivery information";

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Create the HTML content for the receipt
        const receiptHtml = fs.readFileSync("html/receipt.html", "utf8");

        // Set the HTML content of the page
        await page.setContent(receiptHtml);

        // Generate the PDF
        const pdfBuffer = await page.pdf({ format: "Letter" });

        // Set response headers for the PDF
        response.setHeader("Content-Type", "application/pdf");
        response.setHeader(
            "Content-Disposition",
            'attachment; filename="receipt.pdf"'
        );

        // Send the PDF buffer as the res
        response.send(pdfBuffer);

        // Close the browser
        await browser.close();
    } catch (error) {
        console.log(error.message);
        next(new HttpError());
    }
};
