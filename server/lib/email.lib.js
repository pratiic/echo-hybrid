import nodemailer from "nodemailer";
import { google } from "googleapis";

import { capitalizeFirstLetter } from "./strings.lib.js";

export const sendEmail = async (recipientEmail, subject, text) => {
    // try {
    //     const CLIENT_ID =
    //         "1097026222504-e0jakavvd1bgl08ccg55332bd32op9lg.apps.googleusercontent.com";
    //     const CLIENT_SECRET = "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";
    //     const REDIRECT_URI = "https://developers.google.com/oauthplayground";
    //     const REFRESH_TOKEN =
    //         "1//04T4HuIW9umfkCgYIARAAGAQSNwF-L9IriVzmntaccigZBXD-nuqfDgnP0fTkxig6cvRovPFd75g_se1RRoTXj-edHP7ptYH2mvU";
    //     const oAuth2Client = new google.auth.OAuth2(
    //         CLIENT_ID,
    //         CLIENT_SECRET,
    //         REDIRECT_URI
    //     );
    //     oAuth2Client.setCredentials({
    //         refresh_token: REFRESH_TOKEN,
    //     });
    //     const accessToken = await oAuth2Client.getAccessToken();
    //     const transporter = nodemailer.createTransport({
    //         service: "gmail",
    //         auth: {
    //             type: "OAuth2",
    //             user: "echo.ecommerce.web@gmail.com",
    //             clientId: CLIENT_ID,
    //             clientSecret: CLIENT_SECRET,
    //             refreshToken: REFRESH_TOKEN,
    //             accessToken,
    //         },
    //         tls: {
    //             rejectUnauthorized: false,
    //         },
    //     });
    //     transporter.sendMail({
    //         to: recipientEmail,
    //         subject: capitalizeFirstLetter(subject),
    //         text: capitalizeFirstLetter(text),
    //     });
    // } catch (error) {
    //     throw new Error(error);
    // }
};
