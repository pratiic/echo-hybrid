import { fetcher } from "./fetcher";

export const reportTarget = async (targetType, targetId) => {
    try {
        const data = await fetcher(`reports/${targetType}/${targetId}`);

        return data;
    } catch (error) {
        throw error;
    }
};
