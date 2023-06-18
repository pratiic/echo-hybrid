import React from "react";

const StatCard = ({ product, seller, user, order }) => {
  console.log(product, seller, user, order);

  //   return <div>hello</div>;

  const infoStyle = "flex flex-col justify-center items-center";
  const countStyle = "text-lg font-semibold";
  const countNameStyle = "-mt-1 text-sm text-gray-one";

  return (
    <div className="bg-gray-five w-fit px-3 py-2 rounded-xl shadow-md dark-light">
      <h3 className="text-2xl font-semibold capitalize">Product</h3>

      <div className={infoStyle}>
        <p className={`text-2xl text-blue-four ${countStyle}`}>
          {product.total}
        </p>
        <span className={countNameStyle}>Total</span>
      </div>

      <div className="flex space-x-3 mt-3 text-lg">
        <div className={infoStyle}>
          <p className={countStyle}>{product.brandNew}</p>
          <span className={countNameStyle}>New Products</span>
        </div>

        <div className={infoStyle}>
          <p className={countStyle}>{product.secondHand}</p>
          <span className={countNameStyle}>Second Hand Products</span>
        </div>

        <div className={infoStyle}>
          <p className={countStyle}>{product.active}</p>
          <span className={countNameStyle}>Active Products</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
