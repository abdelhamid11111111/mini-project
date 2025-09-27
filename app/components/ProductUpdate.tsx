"use client";
import React, { useState, useEffect } from "react";
import { Categories, Products } from "../types/types";

interface productIdProp {
  productId: number;
  UpdateProducts: (id: number, updatedProduct: Products) => void
}

const ProductUpdate = ({ productId, UpdateProducts }: productIdProp) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Categories[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryId: 0,
  });
  const id = productId;
  const [error, setError] = useState<null | string>(null);

  const handleModal = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    try {
      const fetchCategories = async () => {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data);
      };
      if (isOpen) {
        fetchCategories();
      }
    } catch (error) {
      console.error("server error", error);
    }
  }, [isOpen]);

  useEffect(() => {
    try {
      const fetchProducts = async () => {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        setForm({
          name: data.name,
          description: data.description,
          categoryId: data.categoryId,
        });
      };
      if (isOpen) {
        fetchProducts();
      }
    } catch (error) {
      console.error("server error", error);
    }
  }, [id, isOpen]);

  const handleAddUpdate = async () => {
    try {
      const res = await fetch(`api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsOpen(false);
        setForm({
          name: "",
          description: "",
          categoryId: 0,
        });
        // if(UpdateProducts){
          UpdateProducts?.(id, data)
        // }
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error("server error", error);
      setError(error as string);
    }
  };

  const handleClose = async () => {
    setIsOpen(false);
    setError(null)
  };

  return (
    <div>
      <button
        onClick={handleModal}
        className="text-blue-600 hover:text-blue-800 transition-colors"
      >
        <span>Edit</span>
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md">
            {/* Header */}
            <div className="mb-4">
              <h2 className="text-lg font-bold text-[#111418]">
                Update Product
              </h2>
            </div>

            {/* Error message */}
            {error && (
              <div className="col-span-2 mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-300">
                {error}
              </div>
            )}

            {/* Body */}
            <div className="grid gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-[#111418] font-medium">Product Name</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  type="text"
                  placeholder="Enter product name"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-base text-[#111418] focus:border-blue-500 focus:outline-none focus:ring-0"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[#111418] font-medium">Description</span>
                <input
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  type="text"
                  placeholder="Enter description"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-base text-[#111418] focus:border-blue-500 focus:outline-none focus:ring-0"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[#111418] font-medium">Category</span>
                <select
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm({ ...form, categoryId: Number(e.target.value) })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-base text-[#111418] focus:border-blue-500 focus:outline-none focus:ring-0"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={handleClose}
                className="text-[#617589] bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUpdate}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Update Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductUpdate;
