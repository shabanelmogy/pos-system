import React, { useEffect, useRef } from "react";
import { RiDeleteBin2Fill, RiShoppingCartLine, RiAddFill, RiSubtractFill } from "react-icons/ri";
import { FaNotesMedical } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { removeItem, updateQuantity } from "../../redux/slices/cartSlice";

const CartInfo = () => {
  const cartData = useSelector((state) => state.cart);
  const scrolLRef = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    if (scrolLRef.current) {
      scrolLRef.current.scrollTo({
        top: scrolLRef.current.scrollHeight,
        behavior: "smooth"
      })
    }
  }, [cartData]);

  const handleRemove = (itemId) => {
    dispatch(removeItem(itemId));
  }

  const handleIncrease = (item) => {
    dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }));
  }

  const handleDecrease = (item) => {
    if (item.quantity > 1) {
      dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }));
    } else {
      handleRemove(item.id);
    }
  }

  return (
    <div className="flex flex-col h-full px-3 py-2">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg text-white font-bold tracking-tight">
          Order Details
        </h1>
        <span className="bg-[#f6b100]/20 text-[#f6b100] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
          {cartData.length} {cartData.length === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      <div 
        className="flex-1 overflow-y-auto pr-1 scrollbar-hide space-y-1.5" 
        ref={scrolLRef}
        style={{ maxHeight: '480px' }}
      >
        {cartData.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-[380px] opacity-60">
            <div className="bg-[#2a2a2a] p-4 rounded-full mb-3">
              <RiShoppingCartLine size={32} className="text-[#ababab]" />
            </div>
            <p className="text-[#ababab] text-center text-sm font-medium">Your cart is empty</p>
            <p className="text-[#777] text-xs text-center mt-0.5">Add items to start!</p>
          </div>
        ) : cartData.map((item) => {
          return (
            <div 
              key={item.id} 
              className="group bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#f6b100]/40 rounded-lg p-2.5 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-[#f5f5f5] font-semibold text-sm leading-snug truncate">
                    {item.name}
                  </h3>
                </div>
                <p className="text-[#f6b100] text-base font-bold whitespace-nowrap">₹{item.price}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-[#2a2a2a] rounded-md border border-[#333]">
                    <button 
                      onClick={() => handleDecrease(item)}
                      className="p-1 text-[#ababab] hover:text-[#f6b100] transition-colors"
                    >
                      <RiSubtractFill size={12} />
                    </button>
                    <span className="text-[#f6b100] text-xs font-black min-w-[20px] text-center">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => handleIncrease(item)}
                      className="p-1 text-[#ababab] hover:text-[#f6b100] transition-colors"
                    >
                      <RiAddFill size={12} />
                    </button>
                  </div>
                  <span className="text-[#666] text-[10px]">₹{item.pricePerQuantity || (item.price / item.quantity)}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button 
                    className="p-1.5 bg-[#2a2a2a] hover:bg-[#f6b100]/10 text-[#888] hover:text-[#f6b100] rounded transition-colors duration-200"
                    title="Note"
                  >
                    <FaNotesMedical size={12} />
                  </button>
                  <button 
                    onClick={() => handleRemove(item.id)}
                    className="p-1.5 bg-[#2a2a2a] hover:bg-red-500/10 text-[#888] hover:text-red-500 rounded transition-colors duration-200"
                    title="Remove"
                  >
                    <RiDeleteBin2Fill size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>

  );
};

export default CartInfo;
