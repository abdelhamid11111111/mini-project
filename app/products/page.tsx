"use client";
import React, { useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProductAdd from "../components/ProductAdd";
import ProductUpdate from "../components/ProductUpdate";
import type { Categories, Products } from "../types/types";

export default function Products() {
  const [selected, setSelected] = useState(-1);
  const [categories, setCategories] = useState<Categories[]>([]);
  const [filtered, setFiltered] = useState<Products[]>([]);
  const [products, setProducts] = useState<Products[]>([]);

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

  // fetch products
  useEffect(() => {
    try {
      const fetchProducts = async () => {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);
        setFiltered(data);
      };
      fetchProducts();
    } catch (error) {
      console.error("server error", error);
    }
  }, []);

  // delete product in both states
  const handleDelete = useCallback(async (id: number) => {
    try {
      await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      setProducts((prev) => prev.filter((category) => category.id !== id));
      setFiltered((prev) => prev.filter((category) => category.id !== id));
    } catch (error) {
      console.error("server error", error);
    }
  }, []);

  // those states is where product should upload to display immediately
  const handleUpdateProducts = useCallback(
    async (id: number, updatedProduct: Products) => {
      setFiltered((prev) =>
        prev.map((product) =>
          product.id === id ? { ...product, ...updatedProduct } : product
        )
      );

      setProducts((prev) =>
        prev.map((product) =>
          product.id === id ? { ...product, ...updatedProduct } : product
        )
      );
    },
    [setFiltered, setProducts]
  );

  const handleFilter = useCallback(
    async (category: Categories) => {
      setSelected(category.id);
      if (category.id === 0) {
        setFiltered(products);
      } else {
        setFiltered(
          products.filter((product) => product.categoryId === category.id)
        );
      }
    },
    [products]
  );

  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col bg-gray-50 group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <Navbar />

      {/* Main */}
      <main className="flex-1 px-10 py-8">
        <div className="mx-auto max-w-7xl">
          {" "}
          {/* Increased max width for image column */}
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
                      selected === category.id
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
              }}
            />
          </div>
          {/* Table */}
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
                <tbody className="divide-y divide-gray-200">
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
                            UpdateProducts={handleUpdateProducts}
                          />
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-800 transition-colors font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

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
        </div>
      </main>
    </div>
  );
}
