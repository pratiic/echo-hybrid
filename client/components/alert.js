import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { XIcon } from "@heroicons/react/outline";

import { capitalizeFirstLetter } from "../lib/strings";
import { removeAlert } from "../redux/slices/alerts-slice";

const Alert = ({ id, message, type = "success", active }) => {
  const [alertTimeout, setAlertTimeout] = useState();

  const dispatch = useDispatch();

  const classNameMap = {
    success: `bg-green-200 text-green-700`,
    error: `bg-red-200 text-red-700`,
    info: `bg-blue-100 text-blue-500`,
  };

  const barClassNameMap = {
    success: "bg-green-700",
    error: "bg-red-700",
    info: "bg-blue-700",
  };

  useEffect(() => {
    handleAlertDeletion();
  }, []);

  const handleAlertDeletion = async () => {
    await new Promise((resolve) => {
      setAlertTimeout(
        setTimeout(() => {
          resolve();
        }, 7000)
      );
    });

    deleteAlert();
    clearTimeout(alertTimeout);
  };

  const deleteAlert = () => {
    dispatch(removeAlert(id));
  };

  if (!active) {
    return null;
  }

  return (
    <div
      className={`flex items-center mt-2 px-5 py-2 rounded relative max-w-[450px] w-fit ml-auto ${classNameMap[type]}`}
    >
      <p className="flex-1 font-semibold">{capitalizeFirstLetter(message)}</p>
      <XIcon
        className="w-5 h-5 ml-2 cursor-pointer text-gray-one"
        onClick={deleteAlert}
      />
      <div
        className={`absolute left-0 top-0 bottom-0 opacity-10 origin-left w-full pointer-events-none animate-[alert_7s] ${barClassNameMap[type]}`}
      ></div>
    </div>
  );
};

export default Alert;
