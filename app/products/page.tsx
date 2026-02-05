"use client";
import React, { useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProductAdd from "../components/ProductAdd";
import ProductUpdate from "../components/ProductUpdate";
import type {
  Categories,
  Products,
  PaginationInfo,
  apiRes,
} from "../types/types";
import DeleteModal from "../components/DeleteModal";

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [categories, setCategories] = useState<Categories[]>([]);
  const [filtered, setFiltered] = useState<Products[]>([]);
  const [products, setProducts] = useState<Products[]>([]);
  const [loading, setLoading] = useState(true);

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(
    null,
  );

  // fetch categories
  useEffect(() => {
    try {
      const fetchCategories = async () => {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories([{ id: 0, name: "All" }, ...data]);
      };
      fetchCategories();
    } catch (error) {
      console.error("server error", error);
    }
  }, []);

  // fetch product function, involve page number with category chosen
  const fetchProducts = useCallback(
    async (page: number = 1, categoryId: number = 0) => {
      try {
        setLoading(true);
        const url =
          categoryId === 0
            ? `/api/products?page=${page}`
            : `/api/products?page=${page}&categoryId=${categoryId}`;

        const res = await fetch(url);
        const data: apiRes = await res.json();

        setProducts(data.data);
        setFiltered(data.data);
        setCurrentPage(data.Pagination.currentPage);
        setPaginationInfo(data.Pagination);
        setLoading(false);
      } catch (error) {
        console.error("server error", error);
        setLoading(false);
      }
    },
    [],
  );

  // initial fetch, if user refresh always load first page
  useEffect(() => {
    fetchProducts(1, selectedCategory);
  }, [fetchProducts, selectedCategory]);

  // function for verify is page number is valid
  const goToPage = (page: number) => {
    if (page >= 1 && paginationInfo && paginationInfo.totalPage >= page) {
      fetchProducts(page, selectedCategory);
    }
  };

  // handle delete in paginates and filter cases
  const handleDeleteProducts = useCallback(async () => {
    // those states is where product should delete to disappear immediately
    // setFiltered((prev) => prev.filter((product) => product.id !== id));
    // setProducts((prev) => prev.filter((product) => product.id !== id));

    if (
      paginationInfo &&
      paginationInfo?.totalPage > 1 &&
      products.length === 1
    ) {
      // pass selectedCategory to stay in page of category
      await fetchProducts(currentPage - 1, selectedCategory);
    } else {
      await fetchProducts(currentPage, selectedCategory);
    }
  }, [
    fetchProducts,
    currentPage,
    paginationInfo,
    products.length,
    selectedCategory,
  ]);

  // handle update in paginates and filter cases
  const handleUpdateProducts = useCallback(async () => {
    // those states is where product should update to display immediately
    // setFiltered((prev) =>
    //   prev.map((product) =>
    //     product.id === id ? { ...product, ...updatedProduct } : product,
    //   ),
    // );

    // setProducts((prev) =>
    //   prev.map((product) =>
    //     product.id === id ? { ...product, ...updatedProduct } : product,
    //   ),
    // );
    // pass selectedCategory to stay in page of category
    await fetchProducts(currentPage, selectedCategory);
  }, [setFiltered, setProducts, currentPage, fetchProducts, selectedCategory]);

  const handleFilter = useCallback(async (category: Categories) => {
    // put category user choose in state
    setSelectedCategory(category.id);
  }, []);

  // generate pagination section
  const generatePagination = () => {
    if (!paginationInfo) return [];

    const { currentPage, totalPage } = paginationInfo;
    const generateItems: (string | number)[] = [];

    // if we hv less then 7 page, fetch them all
    if (totalPage <= 7) {
      for (let i = 1; i <= totalPage; i++) {
        generateItems.push(i);
      }
    } else {
      // fix always first page
      generateItems.push(1);

      if (currentPage <= 3) {
        // near start
        generateItems.push(2, 3, 4, "...", totalPage);
      } else if (currentPage > totalPage - 2) {
        // near end
        generateItems.push(
          "...",
          totalPage - 3,
          totalPage - 2,
          totalPage - 1,
          totalPage,
        );
      } else {
        // middle pages
        generateItems.push(
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPage,
        );
      }
    }
    // return final array
    return generateItems;
  };

  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col bg-gray-50 group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <Navbar />

      {/* Main */}
      <main className="flex-1 px-10 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-gray-800 text-3xl font-bold leading-tight">
              My Products
            </h1>
          </div>

          {/* Input + Button */}
          <div className="mb-6 flex justify-between gap-4">
            {/* Filter Options */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  onClick={() => handleFilter(category)}
                  key={category.id}
                  className={`min-w-[100px] rounded-md border border-gray-300 px-4 py-3 text-base text-gray-700 shadow-sm transition focus:outline-none 
                    ${
                      selectedCategory === category.id
                        ? "bg-blue-100 border-blue-300"
                        : "bg-white"
                    }
                    `}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Add Product Button */}
            <ProductAdd
              onAddProduct={(newProduct) => {
                setProducts((prev) => [newProduct, ...prev]);
                setFiltered((prev) => [newProduct, ...prev]);
                fetchProducts(1);
              }}
            />
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="px-6 py-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                  {/* Skeleton loading cards */}
                  <div className="w-full mt-8 space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 animate-pulse"
                      >
                        <div className="h-16 w-16 rounded-lg bg-gray-200"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                        <div className="h-8 w-20 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Table */
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 w-20">
                        Image
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Description
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Date Added
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 min-h-[384px]">
                    {filtered.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Image Column */}
                        <td className="px-6 py-4">
                          <div className="flex-shrink-0 h-16 w-16">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-16 w-16 rounded-lg object-cover border border-gray-200 shadow-sm"
                              />
                            ) : (
                              <div className="h-16 w-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                <svg
                                  className="h-8 w-8 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Name Column */}
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                            {product.name}
                          </div>
                        </td>

                        {/* Description Column */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 max-w-[200px]">
                            <p className="truncate" title={product.description}>
                              {product.description}
                            </p>
                          </div>
                        </td>

                        {/* Category Column */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium text-gray-500">
                            {product.category?.name}
                          </span>
                        </td>

                        {/* Date Column */}
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </td>

                        {/* Actions Column */}
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex items-center gap-3">
                            <ProductUpdate
                              productId={product.id}
                              productName={product.name}
                              productDesc={product.description}
                              productCategory={product.category?.id}
                              productImg={product.image}
                              UpdateProducts={handleUpdateProducts}
                            />
                            <DeleteModal
                              productName={product.name}
                              productId={product.id}
                              DeleteProducts={handleDeleteProducts}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                    {/* Empty placeholder rows - fills up to 4 rows total */}
                    {filtered.length < 4 && filtered.length >= 1 &&
                      Array.from({ length: 4 - filtered.length }).map(
                        (_, index) => (
                          <tr
                            key={`empty-${index}`}
                            className="h-24 border-none"
                          >
                            <td colSpan={6} className="px-6 py-4 border-none">
                              <div className="h-16"></div>
                            </td>
                          </tr>
                        ),
                      )}

                    {paginationInfo && paginationInfo.totalPage > 1 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-4 bg-white border-t border-gray-200"
                        >
                          <div className="flex items-center justify-center gap-2">
                            {/* Previous Button */}
                            <button
                              onClick={() => goToPage(currentPage - 1)}
                              disabled={!paginationInfo.hasPrevPage}
                              className={`px-4 py-2 text-sm font-medium rounded transition-all
            ${
              paginationInfo.hasPrevPage
                ? "text-gray-700 hover:bg-gray-100"
                : "text-gray-300 cursor-not-allowed"
            }`}
                            >
                              « Prev
                            </button>

                            {/* fetch array of pages */}
                            {generatePagination()?.map((numPage, index) => (
                              <React.Fragment key={index}>
                                {numPage === "..." ? (
                                  <span className="px-3 py-2 text-gray-400 text-sm">
                                    •••
                                  </span>
                                ) : (
                                  <button
                                    // go to page of number we clicked, cuz parameter of goToPage it's same as fetchProducts()
                                    onClick={() => goToPage(numPage as number)}
                                    className={`min-w-[40px] px-3 py-2 text-sm font-medium rounded transition-all
                  ${
                    currentPage === numPage
                      ? "bg-blue-500 text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 border border-gray-300 bg-white"
                  }`}
                                  >
                                    {numPage}
                                  </button>
                                )}
                              </React.Fragment>
                            ))}

                            {/* Next Button */}
                            <button
                              onClick={() => goToPage(currentPage + 1)}
                              disabled={!paginationInfo.hasNextPage}
                              className={`px-4 py-2 text-sm font-medium rounded transition-all
            ${
              paginationInfo.hasNextPage
                ? "text-gray-700 hover:bg-gray-100"
                : "text-gray-300 cursor-not-allowed"
            }`}
                            >
                              Next »
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Empty State */}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="text-gray-500">
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400 mb-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7"
                              />
                            </svg>
                            <p className="text-lg font-medium">
                              No products found
                            </p>
                            <p className="mt-1">
                              Get started by adding your first product.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
