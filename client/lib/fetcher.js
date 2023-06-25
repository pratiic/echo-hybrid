import axios from "axios";

import { getProp } from "./local-storage";

export const fetcher = async (url, method = "GET", data, responseType) => {
    const authUser = getProp("authUser");
    const token = authUser ? authUser.token : "";

    try {
        let obj = {
            method,
            url: `http://localhost:8000/api/${url}`,
            data,
            headers: { Authorization: "Bearer " + token },
        };

        if (responseType === "blob") {
            obj = {
                ...obj,
                responseType,
            };
        }

        const res = await axios(obj);

        return res.data;
    } catch (error) {
        const errMsg = error.response?.data?.error;
        const errorObj = new Error(errMsg || "something went wrong, try again");
        errorObj.statusCode = error.response?.status;
        throw errorObj;
    }
};
