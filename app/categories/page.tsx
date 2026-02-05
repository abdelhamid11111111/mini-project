"use client";
import React, { useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import CategoryAdd from "../components/CategoryAdd";
import CategoryUpdate from "../components/CategoryUpdate";
import type { Categories } from "../types/types";

export default function Categories() {
  const [categories, setCategories] = useState<Categories[]>([]);
  const [search, setSearch] = useState('')

  useEffect(() => {
    try {
      const fetchData = async () => {
        const res = await fetch("/api/categories");
        const data = await res.json();
        // setSearch(data)
        setCategories(data);
      };
      fetchData();
    } catch (error) {
      console.error("error", error);
    }
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });
      setCategories(prev => prev.filter((category) => category.id !== id));
    } catch (error) {
      console.error("error", error);
    }
  }, []);

  const handleCategoryUpdated = useCallback(async (id: number, newName: string) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === id 
          ? { ...category, name: newName } 
          : category
      )
    );
  }, []);

  const filteredCategories = categories.filter(category =>
  category.name.toLowerCase().includes(search.toLowerCase())
);

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
              My Categories
            </h1>
          </div>

          {/* Input + Button */}
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input w-full rounded-md border-black-900 bg-white py-3 pl-4 pr-12 text-base shadow-sm transition-shadow focus:border-blue-500 focus:ring-2 focus:ring-blue-200 placeholder:text-gray-400"
                placeholder="search for category..."
                type="text"
              />
            </div>
            <CategoryAdd
              onAddCategory={(newCategory) => 
                setCategories((prev) => [newCategory, ...prev])
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCategories.map((category, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex items-center gap-4">
                        <CategoryUpdate
                          CategoryId={category.id}
                          CategoryName={category.name}
                          updateCategories={handleCategoryUpdated}
                        />
                        <button
                          onClick={() => handleDelete(category.id)}
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
