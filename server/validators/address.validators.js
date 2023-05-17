import Joi from "joi";
import { validate } from "./base.validators.js";

export const addressSchema = Joi.object({
    province: Joi.string()
        .valid(
            "province no 1",
            "madhesh",
            "bagmati",
            "gandaki",
            "lumbini",
            "karnali",
            "sudurpaschim"
        )
        .trim()
        .required(),
    district: Joi.when("province", {
        is: "bagmati",
        then: Joi.string()
            .required()
            .valid(
                "bhaktapur",
                "dhading",
                "kathmandu",
                "kavrepalanchowk",
                "lalitpur",
                "makwanpur",
                "nuwakot",
                "rasuwa",
                "ramechhap",
                "sindhuli",
                "sindhupalchowk",
                "chitwan",
                "dolakha"
            ),
    }),
    city: Joi.string().required().min(5).max(20).trim(),
    area: Joi.string().required().min(5).max(20).trim(),
    description: Joi.string().max(100).allow("").trim(),
});

export const validateAddress = (address) => {
    return validate(address, addressSchema);
};
