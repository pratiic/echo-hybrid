import { UserIcon } from "@heroicons/react/outline";
import { useDispatch } from "react-redux";

import { capitalizeAll, capitalizeFirstLetter } from "../lib/strings";
import { closeModal } from "../redux/slices/modal-slice";

import IconInfo from "./icon-info";
import CustomLink from "./custom-link";

const SellerInfo = ({ store, isMyProduct, isSecondHand }) => {
    const dispatch = useDispatch();

    return (
        <IconInfo icon={<UserIcon className="icon-no-bg" />}>
            <span className="mr-1">Sold by - </span>
            {isMyProduct ? (
                <span className="font-semibold">Me</span>
            ) : (
                <CustomLink
                    href={`/sellers/${store?.id}`}
                    onClick={() => dispatch(closeModal())}
                >
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
