import React, { useState, useEffect } from "react";
import Head from "next/head";
import { BiCategory, BiSearch } from "react-icons/bi";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";

import {
  setCategory,
  setPage,
  setQuery,
} from "../../redux/slices/products-slice";

import Icon from "../../components/icon";
import PageHeader from "../../components/page-header";
import CategoriesPanel from "../../components/categories-panel";
import FilterTrigger from "../../components/filter-trigger";
import ContentList from "../../components/content-list";
import ProductFilterInfo from "../../components/filter-info/product";
import SearchBar from "../../components/search-bar";

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
  const { authUser } = useSelector((state) => state.auth);

  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setQuery(router.query.query || ""));
  }, [router]);

  useEffect(() => {
    if (router.query?.query) {
      setShowSearchBar(true);
    }
  }, [router]);

  const toggleCategoriesPanel = () => {
    setShowCategories(!showCategories);
  };

  const toggleSearchBar = () => {
    setShowSearchBar(!showSearchBar);
    router.query.query = "";
    router.push(router);
  };

  const incrementPageNumber = () => {
    dispatch(setPage(page + 1));
  };

  return (
    <section>
      <Head>
        <title>Explore products</title>
      </Head>

      <div className="flex items-center">
        <div className="flex items-center mb-3 mr-3">
          <Icon
            className="mr-1 -ml-2"
            onClick={toggleCategoriesPanel}
            toolName="categories"
          >
            <BiCategory
              className={`${showCategories ? "icon-active" : "icon"}`}
            />
          </Icon>
          <Icon onClick={toggleSearchBar} toolName="search">
            <BiSearch className={`${showSearchBar ? "icon-active" : "icon"}`} />
          </Icon>
        </div>

        <div className="flex-1">
          <PageHeader
            heading={
              <span>
                <span className="hidden 500:inline">Explore</span>{" "}
                <span className="capitalize 500:lowercase">products</span>
              </span>
            }
            isHeadingComponent={true}
            hasAddBtn={!authUser?.isAdmin && !authUser?.isDeliveryPersonnel}
            addToolname="add product"
            onAddClick={() => router.push("/set-product")}
          >
            <FilterTrigger />
          </PageHeader>
        </div>
      </div>

      <SearchBar
        show={showSearchBar}
        placeholder="Search products"
        resultsCount={totalCount}
        contentType="product"
        value={query}
        className="mb-5 -mt-2"
      />

      <CategoriesPanel
        show={showCategories}
        activeCategory={category}
        showCount={!query}
        setActiveCategory={(categoryName) =>
          dispatch(setCategory(categoryName))
        }
        togglePanel={toggleCategoriesPanel}
      />

      {!showSearchBar && (
        <ProductFilterInfo activeCategory={category} count={totalCount} />
      )}

      <ContentList
        list={products}
        type="product"
        loadingMsg={loading && "Loading products..."}
        error={error}
        emptyMsg={`There are no products ${query &&
          `related to '${query}'`} in this category and filter option`}
        human="no-items"
        incrementPageNumber={
          products.length >= PAGE_SIZE && !noMoreData && incrementPageNumber
        }
        loadingMore={loadingMore}
      />
    </section>
  );
};

export default Products;
