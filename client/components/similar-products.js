import ProductCarousel from "./product-carousel";

const SimilarProducts = ({ products = [] }) => {
    return (
        <div className="mb-9">
            <h3 className="black-white text-xl font-semibold mb-2">
                Similar Products
            </h3>

            <ProductCarousel products={products} />
        </div>
    );
};

export default SimilarProducts;
