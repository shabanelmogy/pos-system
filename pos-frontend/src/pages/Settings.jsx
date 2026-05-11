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
            <div className="flex items-center justify-between px-10 py-8">
                <div className="flex items-center gap-4">
                    <BackButton />
                    <h1 className="text-[#f5f5f5] text-2xl font-black uppercase tracking-tighter">
                        POS Settings
                    </h1>
                </div>
            </div>

            <div className="flex-1 overflow-hidden px-10 pb-20 flex gap-8">

                {/* Left Side: Terminal List */}
                <div className="w-1/3 bg-[#1a1a1a] rounded-[2rem] border border-[#333] flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-[#333]">
                        <h2 className="text-[#ababab] text-[10px] font-black uppercase tracking-widest">Select Terminal</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                        {allTerminals.map((term) => (
                            <button
                                key={term.id}
                                onClick={() => handlePickTerminal(term)}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${selectedTerminal?.id === term.id
                                        ? "bg-[#f6b100] border-[#f6b100] text-[#1a1a1a]"
                                        : "bg-[#1f1f1f] border-transparent text-[#f5f5f5] hover:border-[#f6b100]/30"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <FaTerminal className={selectedTerminal?.id === term.id ? "text-[#1a1a1a]" : "text-[#f6b100]"} />
                                    <div className="text-left">
                                        <p className="text-sm font-black uppercase tracking-tight leading-none">{term.name}</p>
                                        <p className={`text-[8px] font-bold mt-1 ${selectedTerminal?.id === term.id ? "text-[#1a1a1a]/60" : "text-[#666]"}`}>CODE: {term.code}</p>
                                    </div>
                                </div>
                                <FaChevronRight size={12} className={selectedTerminal?.id === term.id ? "opacity-40" : "text-[#333]"} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Side: Settings Detail */}
                <div className="flex-1">
                    <AnimatePresence mode="wait">
                        {selectedTerminal && localSettings ? (
                            <motion.div
                                key={selectedTerminal.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full flex flex-col"
                            >
                                <div className="bg-[#1a1a1a] p-8 rounded-[2rem] border border-[#333] flex-1 overflow-y-auto custom-scrollbar shadow-2xl">
                                    <div className="flex items-center justify-between mb-10 pb-6 border-b border-[#333]">
                                        <div>
                                            <h2 className="text-[#f5f5f5] text-2xl font-black uppercase tracking-tighter">{selectedTerminal.name}</h2>
                                            <p className="text-[#f6b100] text-[10px] font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                                                <FaCheckCircle /> Configuration Active
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-10">
                                        {/* Print Config */}
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-3">
                                                <FaPrint className="text-[#f6b100]" />
                                                <h3 className="text-[#f5f5f5] text-sm font-black uppercase tracking-widest">Printer Config</h3>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between bg-[#1f1f1f] p-4 rounded-2xl border border-[#333]">
                                                    <span className="text-xs text-[#ababab] font-bold uppercase">Auto-Print Receipt</span>
                                                    <button
                                                        onClick={() => handleToggle('autoPrintReceipt')}
                                                        className={`w-10 h-5 rounded-full relative transition-all ${localSettings.autoPrintReceipt ? 'bg-[#f6b100]' : 'bg-[#333]'}`}
                                                    >
                                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${localSettings.autoPrintReceipt ? 'left-6' : 'left-1'}`} />
                                                    </button>
                                                </div>

                                                <div>
                                                    <label className="text-[10px] text-[#666] font-black uppercase tracking-widest block mb-2">Receipt Printer Name</label>
                                                    <input
                                                        type="text"
                                                        name="receiptPrinterName"
                                                        value={localSettings.receiptPrinterName || ""}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-[#1f1f1f] border border-[#333] rounded-xl px-4 py-3 text-[#f5f5f5] text-sm font-bold focus:outline-none focus:border-[#f6b100] transition-colors"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-[10px] text-[#666] font-black uppercase tracking-widest block mb-2">Kitchen Printer Name</label>
                                                    <input
                                                        type="text"
                                                        name="kitchenPrinterName"
                                                        value={localSettings.kitchenPrinterName || ""}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-[#1f1f1f] border border-[#333] rounded-xl px-4 py-3 text-[#f5f5f5] text-sm font-bold focus:outline-none focus:border-[#f6b100] transition-colors"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Rules Config */}
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-3">
                                                <FaUserCheck className="text-[#f6b100]" />
                                                <h3 className="text-[#f5f5f5] text-sm font-black uppercase tracking-widest">Workflow Rules</h3>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between bg-[#1f1f1f] p-4 rounded-2xl border border-[#333]">
                                                    <span className="text-xs text-[#ababab] font-bold uppercase">Require Customer</span>
                                                    <button
                                                        onClick={() => handleToggle('requireCustomerOnOrder')}
                                                        className={`w-10 h-5 rounded-full relative transition-all ${localSettings.requireCustomerOnOrder ? 'bg-[#f6b100]' : 'bg-[#333]'}`}
                                                    >
                                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${localSettings.requireCustomerOnOrder ? 'left-6' : 'left-1'}`} />
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between bg-[#1f1f1f] p-4 rounded-2xl border border-[#333]">
                                                    <span className="text-xs text-[#ababab] font-bold uppercase">Allow Discounts</span>
                                                    <button
                                                        onClick={() => handleToggle('allowDiscounts')}
                                                        className={`w-10 h-5 rounded-full relative transition-all ${localSettings.allowDiscounts ? 'bg-[#f6b100]' : 'bg-[#333]'}`}
                                                    >
                                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${localSettings.allowDiscounts ? 'left-6' : 'left-1'}`} />
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between bg-[#1f1f1f] p-4 rounded-2xl border border-[#333]">
                                                    <span className="text-xs text-[#ababab] font-bold uppercase">Enable Tables</span>
                                                    <button
                                                        onClick={() => handleToggle('enableTables')}
                                                        className={`w-10 h-5 rounded-full relative transition-all ${localSettings.enableTables !== false ? 'bg-[#f6b100]' : 'bg-[#333]'}`}
                                                    >
                                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${localSettings.enableTables !== false ? 'left-6' : 'left-1'}`} />
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between bg-[#1f1f1f] p-4 rounded-2xl border border-[#333]">
                                                    <div>
                                                        <span className="text-xs text-[#ababab] font-bold uppercase">Open On Menu</span>
                                                        <p className="text-[10px] text-[#555] mt-0.5">App opens directly on Menu page on login</p>
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
                                    </div>

                                    <div className="mt-12 pt-8 border-t border-[#333]">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleSave}
                                            disabled={mutation.isPending}
                                            className="w-full bg-[#f6b100] text-[#1a1a1a] py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 shadow-xl shadow-[#f6b100]/10"
                                        >
                                            <FaSave /> {mutation.isPending ? "Applying Changes..." : "Save Terminal Configuration"}
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full bg-[#1a1a1a] rounded-[2rem] border border-[#333] border-dashed flex flex-col items-center justify-center p-10 text-center opacity-30">
                                <FaTerminal size={40} className="mb-4" />
                                <h2 className="text-[#f5f5f5] text-xl font-black uppercase tracking-widest">No Terminal Selected</h2>
                                <p className="text-gray-400 text-xs mt-2 uppercase tracking-widest">Pick a register from the left to view or edit its settings</p>
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
