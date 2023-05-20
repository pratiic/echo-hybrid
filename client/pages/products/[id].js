import React from "react";
import { useSelector } from "react-redux";
import Head from "next/head";
import { capitalizeFirstLetter } from "../../lib/strings";

const ProductPage = () => {
  const { authUser } = useSelector((state) => state.auth);
  const { activeProduct } = useSelector((state) => state.products);

  console.log(activeProduct);
  return (
    <section className="500:mt-3">
      <Head>
        <title>{capitalizeFirstLetter(activeProduct?.name)}</title>
      </Head>

      <div>helllo</div>
    </section>
  );
};

export default ProductPage;
