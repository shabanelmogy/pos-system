import React, { useState } from "react";
import { menus } from "../../constants";
import { GrRadialSelected } from "react-icons/gr";
import { FaShoppingCart } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addItems } from "../../redux/slices/cartSlice";


const MenuContainer = () => {
  const [selected, setSelected] = useState(menus[0]);
  const [itemCount, setItemCount] = useState(0);
  const [itemId, setItemId] = useState();
  const dispatch = useDispatch();

  const increment = (id) => {
    setItemId(id);
    if (itemCount >= 4) return;
    setItemCount((prev) => prev + 1);
  };

  const decrement = (id) => {
    setItemId(id);
    if (itemCount <= 0) return;
    setItemCount((prev) => prev - 1);
  };

  const handleAddToCart = (item) => {
    if(itemCount === 0) return;

    const {name, price} = item;
    const newObj = { id: new Date(), name, pricePerQuantity: price, quantity: itemCount, price: price * itemCount };

    dispatch(addItems(newObj));
    setItemCount(0);
  }


  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-10 py-4 w-[100%]">
        {menus.map((menu) => {
          return (
            <div
              key={menu.id}
              className="flex flex-col items-start justify-between p-4 rounded-lg min-h-[100px] cursor-pointer"
              style={{ backgroundColor: menu.bgColor }}
              onClick={() => {
                setSelected(menu);
                setItemId(0);
                setItemCount(0);
              }}
            >
              <div className="flex items-center justify-between w-full">
                <h1 className="text-[#f5f5f5] text-lg font-semibold">
                  {menu.icon} {menu.name}
                </h1>
                {selected.id === menu.id && (
                  <GrRadialSelected className="text-white" size={20} />
                )}
              </div>
              <p className="text-[#ababab] text-sm font-semibold">
                {menu.items.length} Items
              </p>
            </div>
          );
        })}
      </div>

      <hr className="border-[#2a2a2a] border-t-2 mt-4" />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-10 py-4 w-[100%] overflow-y-auto">
        {selected?.items.map((item) => {
          return (
            <div
              key={item.id}
              className="flex flex-col items-start justify-between p-4 rounded-lg min-h-[160px] cursor-pointer hover:bg-[#2a2a2a] bg-[#1a1a1a] transition-all"
            >
              <div className="flex items-start justify-between w-full gap-2">
                <h1 className="text-[#f5f5f5] text-md sm:text-lg font-semibold line-clamp-2">
                  {item.name}
                </h1>
                <button 
                  onClick={() => handleAddToCart(item)} 
                  className="bg-[#2e4a40] text-[#02ca3a] p-2 rounded-lg flex-none hover:bg-[#3d5a4d] transition-colors"
                >
                  <FaShoppingCart size={18} />
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-between w-full mt-4 gap-2">
                <p className="text-[#f5f5f5] text-lg sm:text-xl font-bold flex-none">
                  ₹{item.price}
                </p>
                <div className="flex items-center justify-between bg-[#1f1f1f] px-2 sm:px-4 py-2 rounded-lg gap-3 sm:gap-6 ml-auto">
                  <button
                    onClick={() => decrement(item.id)}
                    className="text-yellow-500 text-xl sm:text-2xl hover:text-yellow-400"
                  >
                    &minus;
                  </button>
                  <span className="text-white text-sm sm:text-base font-bold min-w-[20px] text-center">
                    {itemId == item.id ? itemCount : "0"}
                  </span>
                  <button
                    onClick={() => increment(item.id)}
                    className="text-yellow-500 text-xl sm:text-2xl hover:text-yellow-400"
                  >
                    &#43;
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default MenuContainer;
