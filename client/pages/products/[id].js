import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Head from "next/head";
import { useRouter } from "next/router";

import { capitalizeFirstLetter } from "../../lib/strings";
import {
    setActiveProduct,
    updateActiveProduct,
} from "../../redux/slices/products-slice";
import { fetcher } from "../../lib/fetcher";
import useSocket from "../../hooks/use-socket";

import ProductInfo from "../../components/product-info";
import Rating from "../../components/rating";
import CommentsContainer from "../../components/comments-container";
import StockView from "../../components/stock-view";
import ProductMenu from "../../components/product-menu";
import Human from "../../components/human";
import InfoBanner from "../../components/info-banner";
import SimilarProducts from "../../components/similar-products";

const ProductPage = () => {
    const [loadingDetails, setLoadingDetails] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [isMyProduct, setIsMyProduct] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [isSuspended, setIsSuspended] = useState(false); // in case a product is suspended while in the details page
    const [isSellerSuspended, setIsSellerSuspended] = useState(false);

    const { authUser } = useSelector((state) => state.auth);
    const { activeProduct } = useSelector((state) => state.products);

    const router = useRouter();
    const dispatch = useDispatch();
    const socket = useSocket();

    //   console.log(activeProduct);

    useEffect(() => {
        if (activeProduct && activeProduct?.store?.userId === authUser?.id) {
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

    useEffect(() => {
        socket.on("product-delete", (id) => {
            if (activeProduct?.id === id) {
                setNotFound(true);
                setErrorMsg("deleted");
            }
        });

        socket.on("product-suspension", (id) => {
            if (activeProduct?.id === id) {
                setIsSuspended(true);
            }
        });
    }, [activeProduct]);

    useEffect(() => {
        setIsSellerSuspended(activeProduct?.store?.suspension);
    }, [activeProduct]);

    const getProductInfo = async () => {
        setLoadingDetails(true);
        dispatch(setActiveProduct(null));

        try {
            const data = await fetcher(`products/${router.query.id}`);

            dispatch(setActiveProduct(data.product));
        } catch (error) {
            if (error.statusCode === 404) {
                setNotFound(true);
            }

            setErrorMsg(error.message);
        } finally {
            setLoadingDetails(false);
        }
    };

    if (loadingDetails) {
        return <p className="status">Loading product details... </p>;
    }

    if (notFound) {
        return (
            <Human name="not-found" message={errorMsg} contentType="product" />
        );
    }

    if (errorMsg) {
        return <p className="status">{errorMsg}</p>;
    }

    if (
        (activeProduct?.suspension || isSuspended) &&
        !authUser?.isAdmin &&
        !isMyProduct
    ) {
        return (
            <Human
                name="suspended"
                message="this product has been suspended and will be accessible once it
                gets reinstated"
            />
        );
    }

    if (isSellerSuspended && !authUser?.isAdmin && !isMyProduct) {
        return (
            <Human
                name="suspended"
                message="the seller of this product has been suspended"
            />
        );
    }

    if (!activeProduct?.isSecondHand && !activeProduct?.stock && !isMyProduct) {
        return (
            <Human
                name="not-active"
                message="this product will be active once the owner sets the stock"
            />
        );
    }

    return (
        <section className="500:mt-3">
            <Head>
                <title>{capitalizeFirstLetter(activeProduct?.name)}</title>
            </Head>

            {(activeProduct?.suspension || isSuspended) && (
                <InfoBanner liftUp={false}>
                    <p>
                        This product has been suspended and is only accessible
                        to the owner and us.
                    </p>
                    <p className="font-semibold">
                        The suspension will be lifted if or when we deem
                        appropriate.
                    </p>
                </InfoBanner>
            )}

            <div className="flex relative">
                <div className="flex-1">
                    <ProductInfo {...activeProduct} isMyProduct={isMyProduct} />
                </div>

                <ProductMenu
                    id={activeProduct?.id}
                    isMyProduct={isMyProduct}
                    hasBeenSold={activeProduct?.hasBeenSold}
                    store={activeProduct?.store}
                />
            </div>

            <div
                className={`flex mt-5 ${
                    activeProduct?.stockType === "flat"
                        ? `${
                              isMyProduct
                                  ? "flex-col 400:flex-row"
                                  : "flex-col 600:flex-row"
                          }`
                        : "flex-col 875:flex-row 1000:flex-col 1100:flex-row"
                }`}
            >
                {/* product stock */}
                {activeProduct?.stock && (
                    <div
                        className={`mb-7 activeProduct?.stockType === "flat" ? "" : "mr-0"`}
                    >
                        <StockView
                            productId={activeProduct?.id}
                            stock={activeProduct?.stock}
                            stockType={activeProduct?.stockType}
                            variations={activeProduct?.variations}
                            userCanBuy={!isMyProduct}
                        />
                    </div>
                )}

                {/* product rating */}
                {!activeProduct?.isSecondHand ||
                    (activeProduct?.stockType === "varied" &&
                        activeProduct?.stock && (
                            <div
                                className={`${
                                    activeProduct?.stockType === "flat"
                                        ? `${
                                              activeProduct?.stock &&
                                              `${
                                                  isMyProduct
                                                      ? "400:ml-7 450:ml-12 500:ml-20"
                                                      : "600:ml-12"
                                              }`
                                          }`
                                        : `${
                                              activeProduct?.stock &&
                                              "875:ml-14 1000:ml-0 1100:ml-14"
                                          }`
                                }`}
                            >
                                <Rating
                                    {...activeProduct}
                                    target={{
                                        id: activeProduct?.id,
                                        name: activeProduct?.name,
                                    }}
                                    userCanRate={!isMyProduct}
                                    onRate={(updateInfo) =>
                                        dispatch(
                                            updateActiveProduct(updateInfo)
                                        )
                                    }
                                />
                            </div>
                        ))}
            </div>

            <SimilarProducts products={activeProduct?.similar} />

            {!activeProduct?.isSecondHand && (
                <CommentsContainer
                    contentId={activeProduct?.id}
                    contentOwner={activeProduct?.store?.user}
                    contentName={activeProduct?.name}
                />
            )}
        </section>
    );
};

export default ProductPage;
