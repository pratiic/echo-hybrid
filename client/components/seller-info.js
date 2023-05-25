import { UserIcon } from "@heroicons/react/outline";

import { capitalizeAll, capitalizeFirstLetter } from "../lib/strings";

import IconInfo from "./icon-info";
import CustomLink from "./custom-link";

const SellerInfo = ({ store, isMyProduct, isSecondHand }) => {
    return (
        <IconInfo icon={<UserIcon className="icon-no-bg" />}>
            <span className="mr-1">Sold by - </span>
            {isMyProduct ? (
                <span className="font-semibold">Me</span>
            ) : (
                <CustomLink href={`/sellers/${store?.id}`}>
                    <span className="link font-semibold">
                        {" "}
                        {isSecondHand
                            ? capitalizeAll(
                                  `${store?.user?.firstName} ${store?.user?.lastName}`
                              )
                            : capitalizeFirstLetter(store?.business?.name)}{" "}
                    </span>
                </CustomLink>
            )}
        </IconInfo>
    );
};

export default SellerInfo;
