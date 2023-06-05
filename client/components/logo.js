import React from "react";
import { useSelector } from "react-redux";
import Image from "next/image";

import CustomLink from "./custom-link";

const Logo = () => {
    const { theme } = useSelector((state) => state.theme);
    const { authUser } = useSelector((state) => state.auth);

    const getRedirectLink = () => {
        if (!authUser) {
            return "/";
        }

        return authUser?.isDeliveryPersonnel ? "/delivery" : "/products";
    };

    return (
        <React.Fragment>
            <CustomLink href={getRedirectLink()} className="-mt-1 rounded">
                <div className="relative h-12 w-28 700:w-32 cursor-pointer">
                    <Image src={`/logo/logo-${theme}.svg`} layout="fill" />
                </div>
            </CustomLink>
            {authUser?.isDeliveryPersonnel && (
                <h5 className="ml-3 dark-light font-semibold tracking-wider">
                    Delivery
                </h5>
            )}
        </React.Fragment>
    );
};

export default Logo;
