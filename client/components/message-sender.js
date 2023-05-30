import React, { useDebugValue, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PaperAirplaneIcon, XCircleIcon } from "@heroicons/react/solid";

import { addOutgoingMsg, removeOutgoingMsg } from "../redux/slices/chat-slice";
import { resetFiles } from "../redux/slices/files-slices";
import { setErrorAlert } from "../redux/slices/alerts-slice";
import { setPreview } from "../lib/files";
import { fetcher } from "../lib/fetcher";

import FileSelector from "../components/file-selector";
import Icon from "./icon";

const MessageSender = ({ chatId }) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const { selectedFiles } = useSelector((state) => state.files);

  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedFiles.length > 0) {
      setImage(selectedFiles[0]);
      setPreview(selectedFiles[0], setImagePreview);
    } else {
      setImage(null);
      setImagePreview("");
    }
  }, [selectedFiles]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!text && !image) {
      // allowed -> text only, image only, both text and image
      return;
    }

    try {
      dispatch(
        addOutgoingMsg({
          text,
          image: imagePreview,
        })
      );

      setText("");
      dispatch(resetFiles());

      const formData = new FormData();

      if (text) {
        formData.append("text", text);
      }

      if (image) {
        formData.append("image", image);
      }

      await fetcher(`messages/${chatId}`, "POST", formData);
    } catch (error) {
      dispatch(setErrorAlert(error.message));
    } finally {
      dispatch(removeOutgoingMsg());
    }
  };

  const renderImagePreview = () => {
    if (!imagePreview) {
      return;
    }

    return (
      <div className={`flex items-start absolute right-2 bottom-[55px]`}>
        <XCircleIcon
          className="icon -mt-1"
          onClick={() => dispatch(resetFiles())}
        />
        <img
          src={imagePreview}
          alt="message img"
          className="max-w-[300px] max-h-[350px] rounded shadow-lg shadow-gray-two dark:shadow-gray-900"
        />
      </div>
    );
  };

  return (
    <div className="max-w-[800px] mx-auto relative">
      {renderImagePreview()}

      <form
        className="h-[45px] rounded-full flex items-center px-3 pl-5 bg-gray-100 dark:bg-gray-600 black-white"
        onSubmit={handleFormSubmit}
      >
        <FileSelector type="icon" />

        <input
          type="text"
          className="outline-none flex-1 ml-1 bg-transparent pr-2"
          placeholder="write a message"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <Icon onClick={handleFormSubmit}>
          <PaperAirplaneIcon className="icon rotate-90" />
        </Icon>
      </form>
    </div>
  );
};

export default MessageSender;
