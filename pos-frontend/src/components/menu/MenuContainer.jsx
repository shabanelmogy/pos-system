import React, { useState, useEffect } from "react";
import { FaShoppingCart, FaSearch } from "react-icons/fa";
import { MdRestaurantMenu } from "react-icons/md";
import { useDispatch } from "react-redux";
import { addItems } from "../../redux/slices/cartSlice";
import { getCategories, getItems } from "../../https";
import { useQuery } from "@tanstack/react-query";

const MenuContainer = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [itemCount, setItemCount] = useState(0);
  const [activeItemId, setActiveItemId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useDispatch();

  // Fetch Categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await getCategories();
      return res.data.data;
    },
  });

  // Set initial category when data loads
  useEffect(() => {
    if (categories?.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  // Fetch Items for Selected Category
  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ["items", selectedCategory?.id],
    queryFn: async () => {
      if (!selectedCategory) return [];
      const res = await getItems(selectedCategory.id);
      return res.data.data;
    },
    enabled: !!selectedCategory,
  });

  const increment = (id) => {
    if (activeItemId !== id) {
      setActiveItemId(id);
      setItemCount(1);
    } else {
      if (itemCount >= 10) return;
      setItemCount((prev) => prev + 1);
    }
  };

  const decrement = (id) => {
    if (activeItemId !== id) return;
    if (itemCount <= 0) return;
    setItemCount((prev) => prev - 1);
  };

  const handleAddToCart = (item) => {
    if (activeItemId !== item.id || itemCount === 0) return;

    const { name, price } = item;
    const priceNum = parseFloat(price);
    const newObj = { 
      id: Date.now(), 
      name, 
      pricePerQuantity: priceNum, 
      quantity: itemCount, 
      price: priceNum * itemCount 
    };

    dispatch(addItems(newObj));
    setItemCount(0);
    setActiveItemId(null);
  };

  const filteredItems = items?.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (categoriesLoading) return <div className="h-40 flex items-center justify-center"><p className="text-[#ababab]">Loading categories...</p></div>;

  return (
    <>
      {/* Category List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-10 py-4 w-[100%]">
        {categories?.map((category) => (
          <div
            key={category.id}
            className={`flex flex-col items-start justify-between p-4 rounded-lg min-h-[100px] cursor-pointer transition-all bg-[#262626] border-2 ${
              selectedCategory?.id === category.id ? "border-[#f6b100] scale-95 shadow-lg shadow-[#f6b100]/20" : "border-transparent opacity-80 hover:opacity-100"
            }`}
            onClick={() => {
              setSelectedCategory(category);
              setActiveItemId(null);
              setItemCount(0);
              setSearchTerm("");
            }}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col items-start text-white">
                <h1 className="text-xl font-bold text-white uppercase">{category.name}</h1>
                <p className="text-xs font-medium opacity-40 uppercase tracking-widest mt-1">Explore Menu</p>
              </div>
              <MdRestaurantMenu className={`text-3xl transition-colors ${selectedCategory?.id === category.id ? "text-[#f6b100]" : "text-white opacity-10"}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="px-10 py-2 flex items-center justify-between gap-4">
        <h2 className="text-[#f5f5f5] text-xl font-bold tracking-wider">
          {selectedCategory?.name || "Items"}
        </h2>
        <div className="bg-[#1a1a1a] flex items-center gap-3 px-4 py-2 rounded-lg border border-[#333] w-full max-w-[300px]">
          <FaSearch className="text-[#ababab] text-sm" />
          <input 
            type="text" 
            placeholder="Search dish..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none text-[#f5f5f5] text-sm w-full"
          />
        </div>
      </div>

      <hr className="border-[#2a2a2a] border-t-2 mx-10" />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-10 py-4 w-[100%] overflow-y-auto custom-scrollbar">
        {itemsLoading ? (
          <p className="text-[#ababab] col-span-full text-center py-10">Loading items...</p>
        ) : filteredItems?.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-start justify-between p-4 rounded-lg min-h-[180px] hover:bg-[#2a2a2a] bg-[#1a1a1a] transition-all border border-[#333] hover:border-[#444]"
            >
              <div className="flex items-start justify-between w-full gap-2">
                <div>
                  <h1 className="text-[#f5f5f5] text-md sm:text-lg font-semibold line-clamp-2">
                    {item.name}
                  </h1>
                  <p className="text-[#ababab] text-[10px] mt-1 line-clamp-2">{item.description}</p>
                </div>
                <button 
                  onClick={() => handleAddToCart(item)} 
                  disabled={activeItemId !== item.id || itemCount === 0}
                  className="bg-[#2e4a40] text-[#02ca3a] p-2 rounded-lg flex-none hover:bg-[#3d5a4d] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <FaShoppingCart size={18} />
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-between w-full mt-4 gap-2">
                <p className="text-[#f6b100] text-lg sm:text-xl font-black">
                  ₹{item.price}
                </p>
                <div className="flex items-center justify-between bg-[#262626] px-2 sm:px-4 py-2 rounded-lg gap-3 sm:gap-6 ml-auto border border-[#333]">
                  <button
                    onClick={() => decrement(item.id)}
                    className="text-[#f5f5f5] text-xl sm:text-2xl hover:text-[#f6b100] transition-colors"
                  >
                    &minus;
                  </button>
                  <span className="text-[#f6b100] text-sm sm:text-base font-black min-w-[20px] text-center">
                    {activeItemId === item.id ? itemCount : "0"}
                  </span>
                  <button
                    onClick={() => increment(item.id)}
                    className="text-[#f5f5f5] text-xl sm:text-2xl hover:text-[#f6b100] transition-colors"
                  >
                    &#43;
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-[#ababab] col-span-full text-center py-10">No items found in this category.</p>
        )}
      </div>
    </>
  );
};

export default MenuContainer;
