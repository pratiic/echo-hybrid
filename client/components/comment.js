import { useRouter } from "next/router";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DotsHorizontalIcon } from "@heroicons/react/outline";
import { BsReplyFill } from "react-icons/bs";

import { getHowLongAgo } from "../lib/date-time";
import { capitalizeFirstLetter } from "../lib/strings";
import { setActiveComment } from "../redux/slices/comments-slice";

import Avatar from "./avatar";
import ChatButton from "./chat-button";
import Icon from "./icon";
import Dropdown from "./dropdown";
import DropdownItem from "./dropdown-item";
import CommentsContainer from "./comments-container";

const Comment = ({
  id,
  text,
  user,
  createdAt,
  image,
  commentType = "review",
  handleCommentDeletion,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const { authUser } = useSelector((state) => state.auth);

  //   console.log(authUser);

  const dispatch = useDispatch();
  const router = useRouter();

  const toggleDropdown = (event) => {
    event.stopPropagation();

    setShowDropdown(!showDropdown);
  };

  const handleUpdateClick = () => {
    dispatch(setActiveComment({ id, text, image }));
  };

  return (
    <div
      className={`px-4 pt-5 ${
        commentType === "reply"
          ? "bg-gray-50 pt-3 mb-3 rounded dark:bg-gray-800"
          : "border-b border-gray-four dark:border-gray-800"
      }`}
    >
      {/* user details  */}
      <div className="flex items-center dark-light">
        <Avatar
          avatar={user?.avatar}
          alt={user?.firstName + " " + user?.lastName}
          small={commentType === "reply"}
        />

        <div className="ml-2 flex-1">
          <p className="capitalize black-white">
            {user?.id === authUser?.id
              ? "me"
              : user?.firstName + " " + user?.lastName}
          </p>
          <p className=" text-xs">{user?.email}</p>
        </div>

        <p className="text-sm">{getHowLongAgo(createdAt)}</p>
      </div>

      {/* text of the comment */}
      <p className=" pt-3 pb-1 text-gray-one dark:text-gray-100 whitespace-pre-wrap">
        {capitalizeFirstLetter(text)}
      </p>

      {/* image of the comment */}
      {image && (
        <div className="mt-2">
          <img
            src={image}
            alt="review-image"
            className="rounded block max-w-[200px] max-h-[200px]"
          />
        </div>
      )}

      {/* footer of the comment  */}
      <div className="flex items-center justify-end space-x-3">
        {/* icon to chat with a comment user */}
        {user?.id !== authUser?.id && <ChatButton small userId={user?.id} />}

        {commentType === "review" && (
          // icon to reply to a review
          <Icon
            toolName="reply"
            onClick={() => {
              setShowReplies(!showReplies);
            }}
          >
            <BsReplyFill
              className={` ${showReplies ? "icon-active" : "icon"}`}
            />
          </Icon>
        )}

        {/* only allow creator of the review to perform certain actions  */}
        {user?.id === authUser?.id && (
          <div className="relative">
            <Icon onClick={toggleDropdown} toolName="options">
              <DotsHorizontalIcon className="icon" />
            </Icon>

            <Dropdown
              show={showDropdown}
              position="top"
              toggleDropdown={toggleDropdown}
            >
              {commentType === "review" && (
                <DropdownItem action="update" onClick={handleUpdateClick}>
                  update {commentType}
                </DropdownItem>
              )}

              <DropdownItem
                action="delete"
                onClick={() => handleCommentDeletion(id)}
              >
                delete {commentType}
              </DropdownItem>
            </Dropdown>
          </div>
        )}

        {/* replies of the comment  */}
        {showReplies && (
          <div className="mt-3">
            <CommentsContainer
              commentType="reply"
              baseCommentId={id}
              baseCommentUserId={user?.id}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Comment;

//   contentId={router.query.id === "me" ? myShop.id : router.query.id}
