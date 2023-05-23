import React, { useState } from "react";
import Head from "next/head";
import { BiCategory, BiSearch } from "react-icons/bi";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";

import { setCategory } from "../../redux/slices/products-slice";

import Icon from "../../components/icon";
import PageHeader from "../../components/page-header";
import CategoriesPanel from "../../components/categories-panel";
import FilterTrigger from "../../components/filter-trigger";
import ContentList from "../../components/content-list";

const Products = () => {
    const [showCategories, setShowCategories] = useState(false);
    const [showSearchBar, setShowSearchBar] = useState(false);

    const {
        products,
        page,
        query,
        loading,
        loadingMore,
        noMoreData,
        error,
        category,
        totalCount,
        PAGE_SIZE,
    } = useSelector((state) => state.products);

    const router = useRouter();
    const dispatch = useDispatch();

    const toggleCategoriesPanel = () => {
        setShowCategories(!showCategories);
    };

    const toggleSearchBar = () => {
        setShowSearchBar(!showSearchBar);
    };

    return (
        <section>
            <Head>
                <title>Explore Products</title>
            </Head>

            <div className="flex items-center">
                <div className="flex items-center mb-3 mr-3">
                    <Icon
                        className="mr-1 -ml-2"
                        onClick={toggleCategoriesPanel}
                        toolName="categories"
                    >
                        <BiCategory
                            className={`${
                                showCategories ? "icon-active" : "icon"
                            }`}
                        />
                    </Icon>
                    <Icon onClick={toggleSearchBar} toolName="search">
                        <BiSearch
                            className={`${
                                showSearchBar ? "icon-active" : "icon"
                            }`}
                        />
                    </Icon>
                </div>

                <div className="flex-1">
                    <PageHeader
                        heading={
                            <span>
                                <span className="hidden 500:inline">
                                    Explore
                                </span>{" "}
                                <span className="capitalize 500:lowercase">
                                    products
                                </span>
                            </span>
                        }
                        isHeadingComponent={true}
                        hasAddBtn
                        onAddClick={() => router.push("/set-product")}
                    >
                        <FilterTrigger />
                    </PageHeader>
                </div>
            </div>

            <CategoriesPanel
                show={showCategories}
                activeCategory={category}
                showCount={!query}
                setActiveCategory={(categoryName) =>
                    dispatch(setCategory(categoryName))
                }
                togglePanel={toggleCategoriesPanel}
            />

            <ContentList
                list={products}
                type="product"
                loadingMsg={loading && "Loading products..."}
                error={error}
                emptyMsg={`There are no products ${query &&
                    `related to '${query}'`} in this category and filter option`}
                human="no-items"
                incrementPageNumber={
                    products.length >= PAGE_SIZE &&
                    !noMoreData &&
                    controlPageNumber
                }
                loadingMore={loadingMore}
            />
        </section>
    );
};

export default Products;
