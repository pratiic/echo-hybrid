import { singularOrPluralCount } from "./strings";

export const getWarrantyDuration = (warranty) => {
    if (!warranty) {
        return "none";
    }

    return warranty % 12 === 0
        ? `${warranty / 12} ${singularOrPluralCount(
              warranty / 12,
              "year",
              "years"
          )}`
        : `${warranty} ${singularOrPluralCount(warranty, "month", "months")}`;
};
