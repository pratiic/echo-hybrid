import React from "react";
import { useSelector } from "react-redux";
import Image from "next/image";

import CustomLink from "./custom-link";

const Logo = () => {
  const { theme } = useSelector((state) => state.theme);
  const { authUser } = useSelector((state) => state.auth);

  return (
    <CustomLink href={authUser ? "/products" : "/"} className="-mt-1 rounded">
      <div className="relative h-12 w-28 700:w-32 cursor-pointer">
        <Image src={`/logo/logo-${theme}.svg`} layout="fill" />
      </div>
    </CustomLink>
  );
};

export default Logo;
