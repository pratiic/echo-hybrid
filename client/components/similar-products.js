import ProductCarousel from "./product-carousel";

const SimilarProducts = ({ products = [] }) => {
    return (
        <div className="mb-5">
            <h3 className="black-white text-xl font-semibold mb-2">
                Similar Products
            </h3>

            {products.length <= 0 && (
                <p className="dark-light text-sm">
                    No similar products right now
                </p>
            )}

            <ProductCarousel products={products} />
        </div>
    );
};

export default SimilarProducts;
