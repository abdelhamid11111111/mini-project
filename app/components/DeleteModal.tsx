import React, { useState, useCallback, useEffect } from "react";



interface ProductProp {
    productName: string;
    productId: number
    DeleteProducts: (id: number) => void
}

const DeleteModal = ({ productName,productId, DeleteProducts }: ProductProp) => {
  const [isOpen, setIsOpen] = useState(false);

  const name = productName;
  const id = productId

  const handleModal = () => {
    setIsOpen(!isOpen);
  };
  const handleClose = () => {
    setIsOpen(false);
  };

  // delete product in both states
  const handleDelete = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
    if (res.ok) {
        setIsOpen(false);
        // put id into prop to disappear product immediately
        DeleteProducts?.(id);
      } 
    } catch (error) {
      console.error("server error", error);
    }
  }, [id]);

  return (
    <div>
      <button
        onClick={handleModal}
        className="text-red-600 hover:text-red-800 transition-colors font-medium"
      >
        <span>Delete</span>
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-3xl">
            {/* Header */}
            <div className="mb-4">
              <h2 className="text-lg font-bold text-[#111418]">
                Delete Product
              </h2>
            </div>

            {/* Error message */}

            {/* Body - 2 column grid */}
            <div className="grid grid-cols-1 ">
              {/* Left Side (Form Fields) */}
              <div className="flex flex-col ">
                <label className="flex flex-col ">
                  <span className="text-[#111418] font-medium">
                    Are you sure wanna delete this product <span className="bg-gray-200 p-2 rounded-lg">{name}</span> ?
                  </span>
                </label>
              </div>
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
                onClick={() => handleDelete(id)}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteModal;
