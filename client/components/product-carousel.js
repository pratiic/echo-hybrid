import React from "react";
import ContentList from "./content-list";

const ProductCarousel = ({ products }) => {
  return (
    <div className="mt-2 overflow-x-auto scrollbar-hide">
      {products.length <= 0 && (
        <p className="status">No similar products found...</p>
      )}

      <ContentList list={products} type="product" />
    </div>
  );
};

export default ProductCarousel;
