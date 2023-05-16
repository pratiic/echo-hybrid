import { AiOutlineUser } from "react-icons/ai";
import { OfficeBuildingIcon } from "@heroicons/react/outline";

const SellerCard = ({ type, text, isSelected, clickHandler }) => {
  const handleCardClick = () => {
    clickHandler(type);
  };

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-3 px-7 py-4 w-fit cursor-pointer rounded hover:bg-gray-100 hover:text-blue-four active:bg-gray-50 transition-all duration-200 ${
        isSelected ? "text-blue-four bg-gray-100" : "dark-light bg-gray-50"
      }`}
      onClick={handleCardClick}
    >
      {type === "individual" ? (
        <AiOutlineUser className="seller-icon" />
      ) : (
        <OfficeBuildingIcon className="seller-icon" />
      )}

      <span>{text}</span>
    </div>
  );
};

export default SellerCard;
