"use client";
import React, { useState, useEffect } from "react";
import type { Categories, Products } from "../types/types";
import Image from "next/image";

interface onAddProductProp {
  onAddProduct?: (newProduct: Products) => void;
}

const ProductAdd = ({ onAddProduct }: onAddProductProp) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Categories[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryId: 0,
    image: null as File | null,
  });

  const handleModal = () => {
    setIsOpen(!isOpen);
  };

  const clearInputs = () => {
    setIsOpen(false);
    setForm({
      name: "",
      description: "",
      categoryId: 0,
      image: null,
    });
    setError(null);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, image: file });

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async () => {
    try {
      const res = await fetch("api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form }),
      });
      const data = await res.json();
      if (res.ok) {
        clearInputs();
        onAddProduct?.(data);
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error("server error", error);
      setError(error as string);
    }
  };

  return (
    <div>
      <button
        onClick={handleModal}
        className="min-w-[100px] flex items-center justify-center rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <span>Add Product</span>
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md">
            {/* Header */}
            <div className="mb-4">
              <h2 className="text-lg font-bold text-[#111418]">Add Product</h2>
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

            {/* Image Upload */}
            <label className="flex flex-col gap-1 mt-4">
              <span className="text-[#111418] font-medium">Product Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-base text-[#111418] focus:border-blue-500 focus:outline-none focus:ring-0"
              />
            </label>

            {/* Image Preview */}
            {
              imagePreview && (
                <div className="flex justify-center">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full h-32 object-cover rounded-md border"
                  />
                </div>
              )
            }

            {/* Footer */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={clearInputs}
                className="text-[#617589] bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductAdd;
