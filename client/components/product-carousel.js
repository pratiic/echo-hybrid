import React from "react";
// import ContentList from "./content-list";
import ContentCard from "./content-card";

const ProductCarousel = ({ products }) => {
    return (
        <div className="mt-3 flex space-x-5 overflow-x-auto scrollbar-hide">
            {products.length <= 0 && (
                <p className="status">No similar products found...</p>
            )}

            {products.map((product) => {
                return (
                    <div className="w-[15rem]">
                        <ContentCard
                            {...product}
                            key={product.id}
                            type="product"
                            forCarousel
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default ProductCarousel;
