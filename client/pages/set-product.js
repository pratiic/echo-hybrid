import { useSelector } from "react-redux";

const SetProduct = () => {
    const { categories } = useSelector((state) => state.categories);

    console.log(categories);

    return <div>SetProduct</div>;
};

export default SetProduct;
