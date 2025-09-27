"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProductAdd from "../components/ProductAdd";
import ProductUpdate from "../components/ProductUpdate";
import type { Categories, Products } from "../types/types";

export default function Products() {
  const [selected, setSelected] = useState(-1);
  const [categories, setCategories] = useState<Categories[]>([]);
  const [filtered, setFiltered] = useState<Products[]>([]);
  const [products, setProducts] = useState<Products[]>([]);

  useEffect(() => {
    try {
      const fetchCategories = async () => {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories([{id: 0, name: 'All'}, ...data]);
      };
      fetchCategories();
    } catch (error) {
      console.error("server error", error);
    }
  }, []);

  useEffect(() => {
    try {
      const fetchProducts = async () => {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data)
        setFiltered(data); 
      };
      fetchProducts();
    } catch (error) {
      console.error("server error", error);
    }
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      setProducts(products.filter((category) => category.id !== id));
    } catch (error) {
      console.error("server error", error);
    }
  };

  const handleUpdateProducts = async (id: number, updatedProduct: Products) => {
    setFiltered((prev) =>
      prev.map((product) =>
        product.id === id 
          ? { ...product, ...updatedProduct } 
          : product
      )
    );
  };

  const handleFilter = async (category: Categories) => {
    setSelected(category.id)
    if(category.id === 0){
      setFiltered(products)
    } else{
      setFiltered(products.filter((product) => product.categoryId === category.id ))
    }
  }
  
  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col bg-gray-50 group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <Navbar />

      {/* Main */}
      <main className="flex-1 px-10 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <h1 className="text-gray-800 text-3xl font-bold leading-tight">
              My Products
            </h1>
          </div>

          {/* Input + Button */}
          <div className="mb-6 flex justify-between gap-4">
            {/* Filter Options */}
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  onClick={() => handleFilter(category)}
                  key={category.id}
                  className={`min-w-[100px] rounded-md border border-gray-300 py-3 text-base text-gray-700 shadow-sm transition focus:outline-none 
                    ${selected === category.id ? "bg-blue-100" : "bg-white"}
                    `}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Add Product Button */}
            <ProductAdd
              onAddProduct={(newProduct) =>
                setFiltered((prev) => [newProduct, ...prev])
              }
            />
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date added
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
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-black-900">
                        {product.description}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-black-900">
                        {product.category?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex items-center gap-4">
                        <ProductUpdate
                          productId={product.id}
                          UpdateProducts={handleUpdateProducts}
                        />
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
