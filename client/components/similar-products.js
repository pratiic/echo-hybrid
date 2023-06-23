import React from "react";
import ContentList from "./content-list";

const SimilarProducts = ({ products }) => {
  console.log(products);

  return (
    <div className="border mb-3">
      <h3 className="black-white text-xl font-semibold">Similar Products</h3>

      {products.length > 0 ? (
        <ContentList list={products} type="product" />
      ) : (
        <p className="status">No similar products found...</p>
      )}
    </div>
  );
};

export default SimilarProducts;
