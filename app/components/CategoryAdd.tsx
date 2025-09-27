"use client";
import React, { useState } from "react";
import type { Category } from "../types/types";

interface onAddCategoryProp {
  onAddCategory?: (newCategory:Category) => void
}

const CategoryAdd = ({ onAddCategory }: onAddCategoryProp) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState<string | null >(null);

  const handleModal = () => {
    setIsOpen(!isOpen);
  };

  const handleAddCategory = async () => {
    try {
      const res = await fetch("api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({categoryName}),
      });
      const data = await res.json()
      if (res.ok) {
        setIsOpen(false);
        setCategoryName('')
        onAddCategory?.(data);
      } else{
        setError(data.error)
      }

    } catch (error) {
      console.error("server error", error);
      setError(error as string);
    }
  };

  const closeModal = async () => {
    setIsOpen(false)
    setCategoryName('')
    setError(null)
  }

  return (
    <div>
      <button
        onClick={handleModal}
        className="flex min-w-[100px] items-center justify-center rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <span>Add Category</span>
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md">
            {/* Header */}
            <div className="mb-4">
              <h2 className="text-lg font-bold text-[#111418]">Add Category</h2>
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
                <span className="text-[#111418] font-medium">
                  Category Name
                </span>
                <input
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  type="text"
                  placeholder="Enter category name"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-base text-[#111418] focus:border-blue-500 focus:outline-none focus:ring-0"
                />
              </label>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={closeModal}
                className="text-[#617589] bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryAdd;
