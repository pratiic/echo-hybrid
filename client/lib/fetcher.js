import axios from "axios";

import { getProp } from "./local-storage";

export const fetcher = async (url, method = "GET", data) => {
    const authUser = getProp("authUser");
    const token = authUser ? authUser.token : "";

    try {
        const res = await axios({
            method,
            url: `http://localhost:8000/api/${url}`,
            data,
            headers: { Authorization: "Bearer " + token },
        });

        return res.data;
    } catch (error) {
        const errMsg = error.response?.data?.error;
        throw new Error(errMsg || "something went wrong, try again");
    }
};
