import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Head from "next/head";
import { useRouter } from "next/router";

import { capitalizeFirstLetter } from "../../lib/strings";
import { setActiveProduct } from "../../redux/slices/products-slice";
import { fetcher } from "../../lib/fetcher";

import ProductInfo from "../../components/product-info";

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
    if (activeProduct && activeProduct?.store?.userId === authUser.id) {
      setIsMyProduct(true);
    } else {
      setIsMyProduct(false);
    }
  }, [authUser, activeProduct]);

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

      dispatch(setActiveProduct(data.product));
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  if (loadingDetails) {
    return <p className="status">Loading product details... </p>;
  }

  if (errorMsg) {
    // return (
    //     <Human name="not-found" message={errorMsg} contentType="product" />
    // );
    return <p className="status">Product not found</p>;
  }

  return (
    <section className="500:mt-3">
      <Head>
        <title>{capitalizeFirstLetter(activeProduct?.name)}</title>
      </Head>

      <div className="flex relative">
        <div className="flex-1">
          <ProductInfo {...activeProduct} isMyProduct={isMyProduct} />
        </div>
      </div>
    </section>
  );
};

export default ProductPage;
