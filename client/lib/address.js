import { capitalizeFirstLetter } from "./strings";

export const getAddress = (address) => {
  if (!address) {
    return "";
  }

  // const { province, district, city, area, description } = address;
  const { city, area } = address;

  return `${capitalizeFirstLetter(city)}, ${capitalizeFirstLetter(area)}`;
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
  { label: "sindhupalchok", value: "sindhupalchok" },
  { label: "rasuwa", value: "rasuwa" },
  { label: "sindhuli", value: "sindhuli" },
  { label: "chitwan", value: "chitwan" },
  { label: "makwanpur", value: "makwanpur" },
  { label: "nuwakot", value: "nuwakot" },
  { label: "kavrepalanchok", value: "kavrepalanchok" },
  { label: "dhading", value: "dhading" },
  { label: "dolakha", value: "dolakha" },
  { label: "ramechhap", value: "ramechhap" },
];
