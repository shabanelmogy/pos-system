import React, { useState, useEffect, useRef } from "react";
import { FaShoppingCart, FaSearch, FaClock, FaHistory, FaCopy, FaUserTie, FaStore } from "react-icons/fa";
import { MdRestaurantMenu, MdChevronLeft, MdChevronRight, MdFullscreen } from "react-icons/md";
import { RiAddFill, RiSubtractFill } from "react-icons/ri";
import useCartStore from "../../store/useCartStore";
import { getCategories, getItems } from "../../api/posApi";
import { getOrders } from "../../../orders/api/orderApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Category, MenuItem } from "../../../../shared/types";
import useUserStore from "../../../auth/store/useUserStore";
import usePOSStore from "../../store/usePOSStore";
import useCustomerStore from "../../../../features/customers/store/useCustomerStore";
import Modal from "../../../../shared/components/Modal";

const MenuContainer: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [itemCount, setItemCount] = useState(0);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { addItem } = useCartStore();
  const { name: userName, role: userRole } = useUserStore();
  const { selectedPOSPoint } = usePOSStore();
  const { customerName, customerPhone, customerId } = useCustomerStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const isGuest = !customerName || customerName === "Guest";
  const queryClient = useQueryClient();

  // Force refetch when customer changes to ensure no "stale" history shows
  useEffect(() => {
    if (customerId) {
      queryClient.invalidateQueries({ queryKey: ["customerLastOrder", customerId] });
      queryClient.invalidateQueries({ queryKey: ["historyOrders", customerId] });
    }
  }, [customerId, queryClient]);

  // Clock Update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Last Order for the SPECIFIC selected customer
  const { data: customerLastOrder } = useQuery({
    queryKey: ["customerLastOrder", customerId, isGuest],
    queryFn: async () => {
      if (isGuest || !customerId) return null;
      const res = await getOrders({ 
        customerId, 
        limit: 1 
      });
      const orders = res.data.data || [];
      return orders.length > 0 ? orders[0] : null;
    },
    enabled: !isGuest && !!customerId,
  });

  // History for the modal - Filters by selected customer if they exist
  const { data: historyOrders } = useQuery({
    queryKey: ["historyOrders", customerId, isGuest],
    queryFn: async () => {
      const params = (isGuest || !customerId) 
        ? { limit: 15 } 
        : { customerId, limit: 15 };
      const res = await getOrders(params);
      return res.data.data || [];
    },
  });

  const handleDuplicateOrder = (order: any) => {
    if (!order || !order.items) return;
    
    order.items.forEach((item: any) => {
      const qty = Number(item.quantity) || 1;
      const menuItem = {
        id: item.menuItemId || item.id,
        name: item.name,
        price: parseFloat(item.price),
        category: item.category || "General",
      };

      // Loop to add the correct quantity to the cart
      for (let i = 0; i < qty; i++) {
        addItem(menuItem as any);
      }
    });
    
    setIsHistoryModalOpen(false);
    // Optional: Scroll cart to bottom or show a success hint
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; 
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const isRtl = document.documentElement.dir === 'rtl';
      const scrollStep = 200;
      let scrollTo;
      
      if (isRtl) {
        scrollTo = direction === "left" ? scrollLeft + scrollStep : scrollLeft - scrollStep;
      } else {
        scrollTo = direction === "left" ? scrollLeft - scrollStep : scrollLeft + scrollStep;
      }
      
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await getCategories();
      return res.data.data as Category[];
    },
  });

  useEffect(() => {
    if (categories && categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ["items", selectedCategory?.id, searchTerm],
    queryFn: async () => {
      // If there is a search term, fetch ALL items (Global Search)
      const res = await getItems(searchTerm ? undefined : selectedCategory?.id);
      return res.data.data as MenuItem[];
    },
    enabled: !!selectedCategory || !!searchTerm,
  });

  const increment = (id: string) => {
    if (activeItemId !== id) {
      setActiveItemId(id);
      setItemCount(1);
    } else {
      if (itemCount >= 99) return;
      setItemCount((prev) => prev + 1);
    }
  };

  const decrement = (id: string) => {
    if (activeItemId !== id) return;
    if (itemCount <= 1) {
      setItemCount(0);
      setActiveItemId(null);
      return;
    }
    setItemCount((prev) => prev - 1);
  };

  const handleAddToCart = (item: MenuItem) => {
    if (activeItemId !== item.id || itemCount === 0) return;
    for (let i = 0; i < itemCount; i++) {
        addItem(item);
    }
    setItemCount(0);
    setActiveItemId(null);
  };

  const filteredItems = items?.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (categoriesLoading)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-[var(--primary)]/20 border-t-[var(--primary)] animate-spin" />
        <p className="text-[var(--text-muted)] text-sm font-semibold tracking-wider uppercase animate-pulse">Loading Menu…</p>
      </div>
    );

  return (
    <>
      <div className="flex items-center justify-between px-6 py-3 bg-[var(--bg-card-alt)] border-b border-[var(--border-main)] backdrop-blur-md sticky top-0 z-[40]">
        <div className="flex items-center gap-6 flex-1">
          {/* Global Search Bar */}
          <div className="relative group w-full max-w-md">
            <FaSearch className="absolute start-4 top-1/2 -translate-y-1/2 text-[var(--text-dim)] group-focus-within:text-[var(--primary)] transition-colors text-sm" />
            <input
              type="text"
              placeholder={`Search anywhere in menu...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-main)] focus:border-[var(--primary)]/60 text-[var(--text-main)] text-sm rounded-xl ps-11 pe-10 py-2.5 outline-none transition-all placeholder-[var(--text-dim)] font-bold shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute end-4 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors text-xs"
              >
                ✕
              </button>
            )}
          </div>
          {/* Last Order Shortcut - ONLY for selected customers (not guest) */}
          {!isGuest && customerLastOrder && (
            <div className="flex items-center gap-3 bg-[var(--bg-card)] px-3 py-1.5 rounded-xl border border-[var(--border-main)] shadow-sm animate-in fade-in slide-in-from-left-2 duration-300">
               <div className="flex flex-col">
                  <span className="text-[9px] text-[var(--text-dim)] font-black uppercase tracking-widest">Customer's Last Order</span>
                  <span className="text-xs font-black text-[var(--text-main)]">₹{customerLastOrder.totalAmount} • {customerLastOrder.orderNumber}</span>
               </div>
               <button 
                onClick={() => handleDuplicateOrder(customerLastOrder)}
                className="flex items-center gap-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-black text-[10px] font-black px-2.5 py-1.5 rounded-lg transition-all active:scale-95 shadow-sm"
                title="Repeat this order"
               >
                  <FaCopy size={10} /> Repeat
               </button>
            </div>
          )}

          <div className="flex items-center gap-2">
             <button 
              onClick={() => setIsHistoryModalOpen(true)}
              className="flex items-center gap-2 bg-[var(--bg-hover)] hover:bg-[var(--primary)]/10 text-[var(--text-muted)] hover:text-[var(--primary)] px-4 py-2 rounded-xl transition-all border border-[var(--border-main)] hover:border-[var(--primary)]/40"
             >
                <FaHistory size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Full History</span>
             </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-tight">{userName || "Staff"}</span>
              <span className="text-[9px] text-[var(--text-dim)] font-bold uppercase tracking-widest">Terminal #01</span>
           </div>
           <div className="flex items-center gap-2 bg-[var(--bg-card)] px-3 py-1.5 rounded-xl border border-[var(--border-main)]">
              <FaClock size={12} className="text-[var(--primary)]" />
              <span className="text-xs font-black text-[var(--text-main)]">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
           </div>
        </div>
      </div>

      {/* ── Order History Modal ── */}
      <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
           <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
                 <FaHistory size={20} />
              </div>
              <div>
                 <h2 className="text-[var(--text-main)] text-lg font-black uppercase tracking-tighter">
                   {isGuest ? "Recent Orders" : `History: ${customerName}`}
                 </h2>
                 <p className="text-[var(--text-dim)] text-[10px] font-bold uppercase tracking-widest">
                   {isGuest ? "Global order history" : `Past orders for this customer`}
                 </p>
              </div>
           </div>

           <div className="space-y-3">
              {historyOrders?.map((order: any) => (
                <div key={order.id} className="bg-[var(--bg-card-alt)] border border-[var(--border-main)] rounded-2xl p-4 hover:border-[var(--primary)]/40 transition-all group">
                   <div className="flex items-center justify-between mb-3">
                      <div className="flex flex-col">
                         <span className="text-xs font-black text-[var(--text-main)] uppercase tracking-tight">{order.orderNumber}</span>
                         <span className="text-[10px] text-[var(--text-dim)] font-bold">{new Date(order.createdAt).toLocaleString()}</span>
                      </div>
                      <span className="text-sm font-black text-[var(--primary)]">₹{order.totalAmount}</span>
                   </div>
                   
                   <div className="flex flex-wrap gap-1.5 mb-4">
                      {order.items?.map((item: any, i: number) => (
                        <span key={i} className="text-[9px] bg-[var(--bg-main)] text-[var(--text-muted)] px-2 py-1 rounded-md border border-[var(--border-main)] font-bold">
                           {item.quantity}x {item.name}
                        </span>
                      ))}
                   </div>

                   <div className="flex gap-2">
                      <button 
                        onClick={() => handleDuplicateOrder(order)}
                        className="flex-1 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-black text-[10px] font-black py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                      >
                         <FaCopy size={12} /> Duplicate Order
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </Modal>

      <div className="relative group/nav px-6 pt-4">
        <button
          onClick={() => scroll("left")}
          className="absolute start-1 top-[calc(50%+8px)] -translate-y-1/2 z-10 bg-[var(--bg-card)]/80 hover:bg-[var(--primary)] text-[var(--primary)] hover:text-black p-1.5 rounded-full lg:opacity-0 lg:group-hover/nav:opacity-100 transition-all duration-300 border border-[var(--border-main)] shadow-xl backdrop-blur-sm rtl:rotate-180"
        >
          <MdChevronLeft size={20} />
        </button>

        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none ${isDragging ? "scroll-auto" : "scroll-smooth"}`}
        >
          <div className="flex items-center gap-2 min-w-max border-b border-[var(--border-main)] pb-0">
            {categories?.map((category) => {
              const isActive = selectedCategory?.id === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category);
                    setActiveItemId(null);
                    setItemCount(0);
                    setSearchTerm("");
                  }}
                  className={`relative flex items-center gap-2 px-5 py-3 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 rounded-t-xl ${isActive
                    ? "bg-[var(--primary)] text-black shadow-lg shadow-[var(--primary)]/20"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)]"
                    }`}
                >
                  <MdRestaurantMenu className={isActive ? "text-black" : "text-[var(--primary)]"} />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={() => scroll("right")}
          className="absolute end-1 top-[calc(50%+8px)] -translate-y-1/2 z-10 bg-[var(--bg-card)]/80 hover:bg-[var(--primary)] text-[var(--primary)] hover:text-black p-1.5 rounded-full lg:opacity-0 lg:group-hover/nav:opacity-100 transition-all duration-300 border border-[var(--border-main)] shadow-xl backdrop-blur-sm rtl:rotate-180"
        >
          <MdChevronRight size={20} />
        </button>
      </div>

      {/* ── Items Grid ── */}
      <div className="px-6 pb-6">
        {itemsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-44 bg-[var(--bg-card)] rounded-2xl animate-pulse border border-[var(--border-main)]" />
            ))}
          </div>
        ) : (filteredItems?.length || 0) > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredItems?.map((item) => {
              const isActive = activeItemId === item.id && itemCount > 0;
              return (
                <div
                  key={item.id}
                  onClick={() => increment(item.id)}
                  className={`relative group flex flex-col justify-between bg-[var(--bg-card)] border-2 rounded-2xl p-4 cursor-pointer transition-all duration-200 select-none overflow-hidden shadow-sm hover:shadow-md ${isActive
                    ? "border-[var(--primary)] shadow-[var(--primary)]/10 bg-[var(--primary-light)]"
                    : "border-[var(--border-main)] hover:border-[var(--primary)]/40 hover:bg-[var(--bg-hover)]"
                    }`}
                >
                  {/* Qty Badge */}
                  {isActive && (
                    <div className="absolute top-2.5 end-2.5 bg-[var(--primary)] text-black text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg z-10">
                      {itemCount}
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${isActive ? "bg-[var(--primary)]/20" : "bg-[var(--bg-hover)] group-hover:bg-[var(--bg-card-alt)]"}`}>
                    <MdRestaurantMenu className={`text-2xl ${isActive ? "text-[var(--primary)]" : "text-[var(--text-dim)]"}`} />
                  </div>

                  <div className="flex-1">
                    <h3 className={`font-bold text-sm leading-snug line-clamp-2 transition-colors ${isActive ? "text-[var(--text-main)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-main)]"}`}>
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-[var(--text-dim)] text-[10px] mt-1 line-clamp-1">{item.description}</p>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[var(--primary)] font-black text-base">₹{item.price}</span>
                    {isActive ? (
                      <div
                        className="flex items-center gap-1 bg-[var(--bg-card-alt)] border border-[var(--border-main)] rounded-lg px-1 py-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => decrement(item.id)}
                          className="w-6 h-6 flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 transition-colors rounded active:scale-90"
                        >
                          <RiSubtractFill size={12} />
                        </button>
                        <span className="text-[var(--text-main)] text-xs font-black min-w-[16px] text-center">
                          {itemCount}
                        </span>
                        <button
                          onClick={() => increment(item.id)}
                          className="w-6 h-6 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors rounded active:scale-90"
                        >
                          <RiAddFill size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-[var(--bg-card-alt)] group-hover:bg-[var(--primary)]/10 flex items-center justify-center transition-colors">
                        <RiAddFill className="text-[var(--text-dim)] group-hover:text-[var(--primary)] transition-colors" size={14} />
                      </div>
                    )}
                  </div>

                  {/* Add to Cart — shown when active */}
                  {isActive && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }}
                      className="mt-3 w-full py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-black text-xs font-black uppercase rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-[var(--primary)]/20"
                    >
                      <FaShoppingCart size={11} />
                      Add {itemCount > 1 ? `${itemCount} items` : "to order"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-4 opacity-40">
            <div className="bg-[var(--bg-card)] p-8 rounded-full">
              <FaSearch size={36} className="text-[var(--text-dim)]" />
            </div>
            <p className="text-[var(--text-muted)] font-semibold text-sm">No items found</p>
          </div>
        )}
      </div>
    </>
  );
};

export default MenuContainer;
