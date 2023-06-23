import ProductCarousel from "./product-carousel";

const SimilarProducts = ({ products = [] }) => {
    return (
        <div className="-mt-3 mb-5">
            <h3 className="black-white text-xl font-semibold mb-2">
                Similar Products
            </h3>

            {products.length <= 0 && (
                <p className="dark-light max-w-sm">No similar products found</p>
            )}

            <ProductCarousel products={products} />
        </div>
    );
};

export default SimilarProducts;
