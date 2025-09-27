"use client";
import React, { useState, useEffect } from "react";

interface CategoryIdProp {
  CategoryId: number;
  updateCategories?: (id: number, newName: string) => void
}

const CategoryUpdate = ({ CategoryId, updateCategories }: CategoryIdProp) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState<null | string>(null);

  const id = CategoryId;

  useEffect(() => {
    try {
      const fetchData = async () => {
        const res = await fetch(`/api/categories/${id}`);
        const data = await res.json();
        setCategoryName(data?.name || "");
      };
      if (isOpen) {
        fetchData();
      }
    } catch (error) {
      console.error("error", error);
    }
  }, [id, isOpen]);

  const handleModal = () => {
    setIsOpen(!isOpen);
    setError(null)
  };

  const handleUpdateCategory = async () => {
    try {
      const res = await fetch(`api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryName }),
      });
      const data = await res.json();
      if (res.ok) {
        if(updateCategories){
          updateCategories(id, categoryName)
        }
        setIsOpen(false);
        setCategoryName("");
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
        className="text-blue-600 hover:text-blue-800 transition-colors"
      >
        Edit
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md">
            {/* Header */}
            <div className="mb-4">
              <h2 className="text-lg font-bold text-[#111418]">
                Update Category
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
                onClick={() => setIsOpen(false)}
                className="text-[#617589] bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCategory}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Update Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryUpdate;
