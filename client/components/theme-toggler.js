import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SunIcon } from "@heroicons/react/outline";
import { BiMoon } from "react-icons/bi";

import { toggleTheme } from "../redux/slices/theme-slice";
import { getProp } from "../lib/local-storage";
// import {useAudio} from "../hooks/use-audio";

const ThemeToggler = () => {
  const [isFocused, setIsFocused] = useState(false);

  const { theme } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  // const [play] = useAudio("toggle");

  useEffect(() => {
    const theme = getProp("theme");

    if (theme) {
      dispatch(toggleTheme(theme));
    }
  }, []);

  const handleThemeChange = () => {
    dispatch(toggleTheme());
    //  play();
  };

  return (
    <button
      className={`flex items-center justify-center px-5 py-2 my-4 rounded-3xl text-gray-one hover:bg-gray-100  active:bg-gray-200  dark:hover:bg-gray-800  dark:active:bg-gray-700  transition-all duration-200 outline-none border border-gray-200 hover:border-gray-100 active:border-gray-200 dark:border-gray-700 dark:hover:border-gray-800 dark:active:border-gray-700 ${isFocused &&
        "bg-gray-100 dark:bg-gray-800"}`}
      onClick={handleThemeChange}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      {theme === "dark" ? (
        <BiMoon className="icon-theme" />
      ) : (
        <SunIcon className="icon-theme" />
      )}

      <span className="ml-3 dark-light">
        {theme === "light" ? "Light" : "Dark"}
      </span>
    </button>
  );
};

export default ThemeToggler;
