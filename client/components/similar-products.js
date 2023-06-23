import React from "react";
import ProductCarousel from "./product-carousel";

const SimilarProducts = ({ products = [] }) => {
  return (
    <div className="mb-5">
      <h3 className="black-white text-xl font-semibold">Similar Products</h3>

      <ProductCarousel products={products} />
    </div>
  );
};

export default SimilarProducts;
