import React, { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { closeModal } from "../redux/slices/modal-slice";
import { capitalizeFirstLetter } from "../lib/strings";

import Spinner from "./spinner";
import Button from "./button";

const Modal = () => {
  const {
    showModal,
    type,
    message,
    confirmationHandler,
    children,
    overflowScroll,
  } = useSelector((state) => state.modal);

  const dispatch = useDispatch();
  const modalRef = useRef();

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.focus();
    }
  });

  const handleOverlayClick = (event) => {
    event.target.id === "modal-overlay" &&
      type !== "loading" &&
      dispatch(closeModal());
  };

  const handleKeyPress = (event) => {
    if (event.code === "Escape") {
      dispatch(closeModal());
    }
  };

  if (!showModal) {
    return null;
  }

  return (
    <div
      id="modal-overlay"
      className={`flex items-center justify-center fixed top-0 left-0 min-h-screen min-w-[100vw] z-40 bg-modal-light dark:bg-modal-dark`}
      onClick={handleOverlayClick}
    >
      <div
        className={`bg-white dark:bg-gray-800 py-4 rounded-lg shadow-2xl max-h-screen outline-none ${
          type !== "generic" ? "px-7 max-w-[350px]" : "max-w-full px-5"
        } ${overflowScroll && "overflow-y-scroll"}`}
        ref={modalRef}
        tabIndex={-1}
        onKeyDown={handleKeyPress}
      >
        {type === "loading" && (
          <div className="flex flex-col items-center text-lg dark-light py-3">
            <span className="mr-3">{capitalizeFirstLetter(message)}</span>
            <Spinner />
          </div>
        )}

        {type === "confirmation" && (
          <div className="black-white">
            <h3 className="text-2xl text-center mb-5 leading-tight">
              {capitalizeFirstLetter(message)}
            </h3>
            <div className="flex space-x-2">
              <Button small full onClick={confirmationHandler}>
                Yes
              </Button>

              <Button
                type="secondary"
                small
                full
                onClick={() => dispatch(closeModal())}
              >
                No
              </Button>
            </div>
          </div>
        )}

        {type === "generic" && <div>{children}</div>}
      </div>
    </div>
  );
};

export default Modal;
