import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Head from "next/head";
import { capitalizeFirstLetter } from "../../lib/strings";
import { useRouter } from "next/router";

import { setActiveProduct } from "../../redux/slices/products-slice";
import { fetcher } from "../../lib/fetcher";

const ProductPage = () => {
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isMyProduct, setIsMyProduct] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const { authUser } = useSelector((state) => state.auth);
  const { activeProduct } = useSelector((state) => state.products);

  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    if (router.query.id) {
      getProductInfo();
    }
  }, [router]);

  const getProductInfo = async () => {
    setLoadingDetails(true);
    dispatch(setActiveProduct(null));

    try {
      const data = await fetcher(`products/${router.query.id}`);

      console.log(data);
    } catch (error) {
      console.log(error.message);
      setErrorMsg(error.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <section className="500:mt-3">
      <Head>
        <title>{capitalizeFirstLetter(activeProduct?.name)}</title>
      </Head>

      {/* <Gallery /> */}
    </section>
  );
};

export default ProductPage;
