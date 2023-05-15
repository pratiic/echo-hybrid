import React from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";

import Logo from "./logo";
import HamburgerMenu from "./hamburger-menu";
import Button from "./button";
import ProfilePreview from "./profile-preview";

const Header = () => {
  const { authUser } = useSelector((state) => state.auth);
  const router = useRouter();

  const renderButton = () => {
    return (
      <Button
        type="secondary"
        onClick={() =>
          router.push(router.pathname.includes("signup") ? "/signin" : "signup")
        }
      >
        {router.pathname.includes("signup") ? "sign in" : "sign up"}
      </Button>
    );
  };

  return (
    <header
      className={
        "border-b border-faint sticky top-0 z-20 bg-white dark:bg-gray-seven"
      }
    >
      <div className="h-16 flex items-center justify-between wrapper">
        <div className="flex items-center justify-center">
          {authUser && <HamburgerMenu />}

          <Logo />
        </div>
      </div>

      <div className="flex items-center">
        {!authUser && router.pathname !== "/" && renderButton()}

        {authUser && <ProfilePreview />}
      </div>
    </header>
  );
};

export default Header;
