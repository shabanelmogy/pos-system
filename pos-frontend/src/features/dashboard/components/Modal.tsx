import React from "react";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import useAddTable from "../hooks/useAddTable";

interface ModalProps {
  setIsTableModalOpen: (isOpen: boolean) => void;
}

const Modal: React.FC<ModalProps> = ({ setIsTableModalOpen }) => {
  const { register, onSubmit, errors, isLoading } = useAddTable({ setIsTableModalOpen });

  const handleCloseModal = () => {
    setIsTableModalOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-[var(--bg-card-alt)] p-6 rounded-lg shadow-lg w-96"
      >
        {/* Modal Header */}
        <div className="flex justify-between item-center mb-4">
          <h2 className="text-[var(--text-main)] text-xl font-semibold">Add Table</h2>
          <button
            onClick={handleCloseModal}
            className="text-[var(--text-main)] hover:text-red-500"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={onSubmit} className="space-y-4 mt-10">
          <div>
            <label className="block text-[var(--text-muted)] mb-2 mt-3 text-sm font-medium">
              Table Number
            </label>
            <div className={`flex item-center rounded-lg p-5 px-4 bg-[var(--bg-main)] border ${errors.tableNo ? 'border-red-500' : 'border-transparent'}`}>
              <input
                type="number"
                {...register("tableNo")}
                className="bg-transparent flex-1 text-white focus:outline-none"
              />
            </div>
            {errors.tableNo && <span className="text-[10px] text-red-500 font-bold mt-1 block uppercase tracking-wider">{errors.tableNo.message as string}</span>}
          </div>
          <div>
            <label className="block text-[var(--text-muted)] mb-2 mt-3 text-sm font-medium">
              Number of Seats
            </label>
            <div className={`flex item-center rounded-lg p-5 px-4 bg-[var(--bg-main)] border ${errors.seats ? 'border-red-500' : 'border-transparent'}`}>
              <input
                type="number"
                {...register("seats")}
                className="bg-transparent flex-1 text-white focus:outline-none"
              />
            </div>
            {errors.seats && <span className="text-[10px] text-red-500 font-bold mt-1 block uppercase tracking-wider">{errors.seats.message as string}</span>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg mt-10 mb-6 py-3 text-lg bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-500 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Adding..." : "Add Table"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Modal;
