import React from "react";

const Avatar = ({ avatar, small, smaller }) => {
  return (
    <div
      className={`bg-gray-200 rounded-full ${
        small
          ? "h-[40px] w-[40px]"
          : smaller
          ? "h-9 w-9"
          : "h-9 w-9 500:h-11 500:w-11"
      }`}
    >
      <img
        src={`${avatar}`}
        alt="av"
        className="rounded-full w-full h-full object-cover"
      />
    </div>
  );
};

export default Avatar;
