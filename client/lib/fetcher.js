import axios from "axios";

import { getProp } from "./local-storage";
import { store } from "../redux/store";
import { signUserOut } from "../redux/slices/auth-slice";

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

        if (errMsg === "jwt expired") {
            // sign user out
            store.dispatch(signUserOut());
        } else {
            const errorInstance = new Error(
                errMsg || "something went wrong, try again"
            );
            errorInstance.statusCode = error.response?.status;
            throw errorInstance;
        }
    }
};
