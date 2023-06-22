import axios from "axios";

export const fetcher = async (url, method = "GET", data) => {
    try {
        const res = await axios({
            method,
            url: `http://127.0.0.1:8080/${url}`,
            data,
        });

        return res.data;
    } catch (error) {
        const errMsg = error.response?.data?.detail;
        const errorObj = new Error(errMsg || "something went wrong, try again");
        throw errorObj;
    }
};
