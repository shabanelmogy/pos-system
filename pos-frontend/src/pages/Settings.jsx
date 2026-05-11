import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllPosSettings, updatePosSettings } from "../https";
import { enqueueSnackbar } from "notistack";
import { setSelectedPOSPoint } from "../redux/slices/posSlice";
import BackButton from "../components/shared/BackButton";
import BottomNav from "../components/shared/BottomNav";
import { FaPrint, FaUserCheck, FaSave, FaTerminal, FaChevronRight, FaCheckCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Settings = () => {
    const dispatch = useDispatch();
    const { selectedPOSPoint: currentActiveTerminal } = useSelector(state => state.pos);
    const queryClient = useQueryClient();
    const [selectedTerminal, setSelectedTerminal] = useState(null);
    const [localSettings, setLocalSettings] = useState(null);

    const { data: allTerminals = [], isLoading, isError, error } = useQuery({
        queryKey: ["all-pos-settings"],
        queryFn: async () => {
            const res = await getAllPosSettings();
            return res.data.data;
        }
    });

    // When a terminal is picked from the list
    const handlePickTerminal = (terminal) => {
        setSelectedTerminal(terminal);
        setLocalSettings(terminal.settings);
    };

    const mutation = useMutation({
        mutationFn: (data) => updatePosSettings(selectedTerminal.id, data),
        onSuccess: (res) => {
            queryClient.invalidateQueries(["all-pos-settings"]);
            enqueueSnackbar("Settings saved successfully!", { variant: "success" });
            
            // If the terminal we just updated is the one we are currently using, update Redux state
            if (currentActiveTerminal && currentActiveTerminal.id === selectedTerminal.id) {
                const updatedTerminal = {
                    ...selectedTerminal,
                    settings: res.data.data
                };
                dispatch(setSelectedPOSPoint(updatedTerminal));
            }
        },
        onError: () => {
            enqueueSnackbar("Failed to save settings", { variant: "error" });
        }
    });

    const handleToggle = (field) => {
        setLocalSettings(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        mutation.mutate(localSettings);
    };

    if (isLoading) {
        return (
            <div className="bg-[#1f1f1f] h-screen flex items-center justify-center text-white font-black uppercase tracking-widest opacity-20">
                Synchronizing Terminals...
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-[#1f1f1f] h-screen flex flex-col items-center justify-center text-white p-10 text-center">
                <h2 className="text-red-500 font-black uppercase text-2xl mb-4">Sync Error</h2>
                <p className="text-gray-400 text-sm mb-6">{error?.message || "Failed to sync terminal settings"}</p>
                <BackButton />
            </div>
        );
    }

    return (
        <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 md:px-10 py-6 md:py-8">
                <div className="flex items-center gap-4">
                    <BackButton />
                    <div>
                        <h1 className="text-[#f5f5f5] text-2xl font-black uppercase tracking-tighter">
                            POS Settings
                        </h1>
                        <p className="text-[#ababab] text-[10px] font-bold uppercase tracking-widest mt-1">Configure your terminal hardware and workflow</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden px-6 md:px-10 pb-24 lg:pb-10 flex flex-col lg:flex-row gap-6 md:gap-8">

                {/* Left Side: Terminal List */}
                <div className="w-full lg:w-1/3 bg-[#1a1a1a] rounded-3xl border border-[#333] flex flex-col overflow-hidden max-h-[300px] lg:max-h-full">
                    <div className="p-5 border-b border-[#333] bg-[#222]/30">
                        <h2 className="text-[#ababab] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <FaTerminal className="text-[#f6b100]" /> Registered Terminals
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                        {allTerminals.map((term) => (
                            <button
                                key={term.id}
                                onClick={() => handlePickTerminal(term)}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${selectedTerminal?.id === term.id
                                        ? "bg-[#f6b100] border-[#f6b100] text-[#1a1a1a] shadow-lg shadow-[#f6b100]/10"
                                        : "bg-[#1f1f1f] border-transparent text-[#f5f5f5] hover:border-[#f6b100]/30"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${selectedTerminal?.id === term.id ? "bg-[#1a1a1a]/10" : "bg-[#1a1a1a]"}`}>
                                        <FaTerminal className={selectedTerminal?.id === term.id ? "text-[#1a1a1a]" : "text-[#f6b100]"} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-black uppercase tracking-tight leading-none">{term.name}</p>
                                        <p className={`text-[8px] font-bold mt-1 ${selectedTerminal?.id === term.id ? "text-[#1a1a1a]/60" : "text-[#666]"}`}>ID: {term.code}</p>
                                    </div>
                                </div>
                                <FaChevronRight size={10} className={selectedTerminal?.id === term.id ? "opacity-40" : "text-[#333]"} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Side: Settings Detail */}
                <div className="flex-1 overflow-hidden h-full">
                    <AnimatePresence mode="wait">
                        {selectedTerminal && localSettings ? (
                            <motion.div
                                key={selectedTerminal.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full flex flex-col"
                            >
                                <div className="bg-[#1a1a1a] rounded-3xl border border-[#333] flex-1 overflow-y-auto custom-scrollbar shadow-2xl relative flex flex-col">
                                    
                                    {/* Sub-Header */}
                                    <div className="sticky top-0 z-10 bg-[#1a1a1a]/80 backdrop-blur-md p-6 border-b border-[#333] flex items-center justify-between">
                                        <div>
                                            <h2 className="text-[#f5f5f5] text-xl font-black uppercase tracking-tighter">{selectedTerminal.name}</h2>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[#f6b100] text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                                    <FaCheckCircle size={10} /> Configuration Mode
                                                </span>
                                                <span className="w-1 h-1 bg-[#333] rounded-full"></span>
                                                <span className="text-[#666] text-[9px] font-bold uppercase tracking-widest">Code: {selectedTerminal.code}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleSave}
                                            disabled={mutation.isPending}
                                            className="bg-[#f6b100] text-[#1a1a1a] px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-[#ffc107] transition-all shadow-lg shadow-[#f6b100]/10 disabled:opacity-50 disabled:grayscale"
                                        >
                                            <FaSave /> {mutation.isPending ? "Saving..." : "Save Changes"}
                                        </button>
                                    </div>

                                    <div className="p-8 space-y-10">
                                        
                                        {/* Hardware & Printing Section */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 border-l-2 border-[#f6b100] pl-4">
                                                <FaPrint className="text-[#f6b100]" size={14} />
                                                <h3 className="text-[#f5f5f5] text-xs font-black uppercase tracking-[0.2em]">Hardware & Printing</h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-[#1f1f1f] p-5 rounded-2xl border border-[#333] flex items-center justify-between group hover:border-[#f6b100]/30 transition-all">
                                                    <div>
                                                        <span className="text-[10px] text-[#f5f5f5] font-black uppercase tracking-widest block">Auto-Print Receipt</span>
                                                        <p className="text-[9px] text-[#666] mt-1 font-medium">Prints receipt automatically after payment</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleToggle('autoPrintReceipt')}
                                                        className={`w-10 h-5 rounded-full relative transition-all ${localSettings.autoPrintReceipt ? 'bg-[#f6b100]' : 'bg-[#333]'}`}
                                                    >
                                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${localSettings.autoPrintReceipt ? 'left-6' : 'left-1'}`} />
                                                    </button>
                                                </div>

                                                <div className="bg-[#1f1f1f] p-5 rounded-2xl border border-[#333] space-y-3 group hover:border-[#f6b100]/30 transition-all">
                                                    <label className="text-[10px] text-[#ababab] font-black uppercase tracking-widest block">Receipt Printer</label>
                                                    <input
                                                        type="text"
                                                        name="receiptPrinterName"
                                                        value={localSettings.receiptPrinterName || ""}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter printer name..."
                                                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-[#f5f5f5] text-xs font-bold focus:outline-none focus:border-[#f6b100] transition-colors"
                                                    />
                                                </div>

                                                <div className="bg-[#1f1f1f] p-5 rounded-2xl border border-[#333] space-y-3 group hover:border-[#f6b100]/30 transition-all">
                                                    <label className="text-[10px] text-[#ababab] font-black uppercase tracking-widest block">Kitchen Printer</label>
                                                    <input
                                                        type="text"
                                                        name="kitchenPrinterName"
                                                        value={localSettings.kitchenPrinterName || ""}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter printer name..."
                                                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-[#f5f5f5] text-xs font-bold focus:outline-none focus:border-[#f6b100] transition-colors"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Flow & Validation Section */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 border-l-2 border-[#f6b100] pl-4">
                                                <FaUserCheck className="text-[#f6b100]" size={14} />
                                                <h3 className="text-[#f5f5f5] text-xs font-black uppercase tracking-[0.2em]">Order Flow & Rules</h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-[#1f1f1f] p-5 rounded-2xl border border-[#333] flex items-center justify-between group hover:border-[#f6b100]/30 transition-all">
                                                    <div>
                                                        <span className="text-[10px] text-[#f5f5f5] font-black uppercase tracking-widest block">Mandatory Customer</span>
                                                        <p className="text-[9px] text-[#666] mt-1 font-medium">Require customer info before taking order</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleToggle('requireCustomerOnOrder')}
                                                        className={`w-10 h-5 rounded-full relative transition-all ${localSettings.requireCustomerOnOrder ? 'bg-[#f6b100]' : 'bg-[#333]'}`}
                                                    >
                                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${localSettings.requireCustomerOnOrder ? 'left-6' : 'left-1'}`} />
                                                    </button>
                                                </div>

                                                <div className="bg-[#1f1f1f] p-5 rounded-2xl border border-[#333] flex items-center justify-between group hover:border-[#f6b100]/30 transition-all">
                                                    <div>
                                                        <span className="text-[10px] text-[#f5f5f5] font-black uppercase tracking-widest block">Allow Discounts</span>
                                                        <p className="text-[9px] text-[#666] mt-1 font-medium">Enable discount field on the cart</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleToggle('allowDiscounts')}
                                                        className={`w-10 h-5 rounded-full relative transition-all ${localSettings.allowDiscounts ? 'bg-[#f6b100]' : 'bg-[#333]'}`}
                                                    >
                                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${localSettings.allowDiscounts ? 'left-6' : 'left-1'}`} />
                                                    </button>
                                                </div>

                                                <div className="bg-[#1f1f1f] p-5 rounded-2xl border border-[#333] flex items-center justify-between group hover:border-[#f6b100]/30 transition-all">
                                                    <div>
                                                        <span className="text-[10px] text-[#f5f5f5] font-black uppercase tracking-widest block">Enable Tables</span>
                                                        <p className="text-[9px] text-[#666] mt-1 font-medium">Show table selection for Dine-in orders</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleToggle('enableTables')}
                                                        className={`w-10 h-5 rounded-full relative transition-all ${localSettings.enableTables !== false ? 'bg-[#f6b100]' : 'bg-[#333]'}`}
                                                    >
                                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${localSettings.enableTables !== false ? 'left-6' : 'left-1'}`} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Advanced Features Section */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 border-l-2 border-[#f6b100] pl-4">
                                                <FaChevronRight className="text-[#f6b100]" size={14} />
                                                <h3 className="text-[#f5f5f5] text-xs font-black uppercase tracking-[0.2em]">Advanced Features</h3>
                                            </div>

                                            <div className="bg-[#1f1f1f] p-5 rounded-2xl border border-[#333] flex items-center justify-between group hover:border-[#f6b100]/30 transition-all">
                                                <div>
                                                    <span className="text-[10px] text-[#f5f5f5] font-black uppercase tracking-widest block">Quick Menu Startup</span>
                                                    <p className="text-[9px] text-[#666] mt-1 font-medium">Bypass home screen and open directly to menu on login</p>
                                                </div>
                                                <button
                                                    onClick={() => handleToggle('openOnMenu')}
                                                    className={`w-10 h-5 rounded-full relative transition-all ${localSettings.openOnMenu ? 'bg-[#f6b100]' : 'bg-[#333]'}`}
                                                >
                                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${localSettings.openOnMenu ? 'left-6' : 'left-1'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Extra spacing at bottom */}
                                    <div className="h-20 shrink-0"></div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full bg-[#1a1a1a] rounded-3xl border border-[#333] border-dashed flex flex-col items-center justify-center p-10 text-center opacity-30">
                                <div className="w-20 h-20 bg-[#1f1f1f] rounded-full flex items-center justify-center mb-6">
                                    <FaTerminal size={32} className="text-[#f6b100]" />
                                </div>
                                <h2 className="text-[#f5f5f5] text-xl font-black uppercase tracking-tighter mb-2">Configure Terminal</h2>
                                <p className="text-[#666] text-[10px] uppercase tracking-[0.2em] max-w-[200px]">Select a register from the left panel to begin configuration</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

            </div>

            <BottomNav />
        </section>
    );
};

export default Settings;
