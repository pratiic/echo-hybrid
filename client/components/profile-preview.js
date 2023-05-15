import { useRouter } from "next/router";
import React from "react";
import { useSelector } from "react-redux";
import CustomLink from "./custom-link";
import Avatar from "./avatar";

const ProfilePreview = () => {
  const { authUser } = useSelector((state) => state.auth);

  const router = useRouter();

  return (
    <CustomLink
      className="flex h-full items-center rounded py-1 hover:cursor-pointer"
      onClick={() => router.push("/products")}
    >
      <span className="mr-2 500:mr-3 text-base 500:text-lg capitalize black-white max-w-[150px] 500:max-w-[250px] truncate">
        {authUser?.firstName + "" + authUser?.lastName}

        <Avatar avatar={authUser?.avatar} />
      </span>
    </CustomLink>
  );
};

export default ProfilePreview;
