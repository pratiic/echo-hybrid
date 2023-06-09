import { capitalizeFirstLetter } from "./strings";

export const getAddress = (address, getDescription) => {
    if (!address) {
        return "";
    }

    // const { province, district, city, area, description } = address;
    const { city, area, description } = address;

    return `${capitalizeFirstLetter(area)}, ${capitalizeFirstLetter(city)} ${
        getDescription ? (description ? `\n(${description})` : "") : ""
    }`;
};

export const provinceOptions = [
    { label: "bagmati", value: "bagmati" },
    { label: "province no 1", value: "province no 1" },
    { label: "lumbini", value: "lumbini" },
    { label: "sudurpaschim", value: "sudurpaschim" },
    { label: "madhesh", value: "madhesh" },
    { label: "gandaki", value: "gandaki" },
    { label: "karnali", value: "karnali" },
];

export const districtOptions = [
    { label: "kathmandu", value: "kathmandu" },
    { label: "lalitpur", value: "lalitpur" },
    { label: "bhaktapur", value: "bhaktapur" },
    { label: "sindhupalchowk", value: "sindhupalchowk" },
    { label: "rasuwa", value: "rasuwa" },
    { label: "sindhuli", value: "sindhuli" },
    { label: "chitwan", value: "chitwan" },
    { label: "makwanpur", value: "makwanpur" },
    { label: "nuwakot", value: "nuwakot" },
    { label: "kavrepalanchowk", value: "kavrepalanchowk" },
    { label: "dhading", value: "dhading" },
    { label: "dolakha", value: "dolakha" },
    { label: "ramechhap", value: "ramechhap" },
];
