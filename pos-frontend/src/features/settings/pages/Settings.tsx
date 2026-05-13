import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllPosSettings, updatePosSettings } from "../api/settingsApi";
import { enqueueSnackbar } from "notistack";
import usePOSStore from "../../pos/store/usePOSStore";
import BackButton from "../../../shared/components/BackButton";
import BottomNav from "../../../shared/components/BottomNav";
import { FaPrint, FaUserCheck, FaSave, FaTerminal, FaChevronRight, FaCheckCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface POSSettings {
  autoPrintReceipt?: boolean;
  directPrint?: boolean;
  receiptPrinterName?: string;
  kitchenPrinterName?: string;
  requireCustomerOnOrder?: boolean;
  allowDiscounts?: boolean;
  enableTables?: boolean;
  openOnMenu?: boolean;
  [key: string]: any;
}

interface Terminal {
  id: string;
  name: string;
  code: string;
  settings: POSSettings;
}

const Settings: React.FC = () => {
    const { selectedPOSPoint: currentActiveTerminal, setSelectedPOSPoint } = usePOSStore();
    const queryClient = useQueryClient();
    const [selectedTerminal, setSelectedTerminal] = useState<Terminal | null>(null);
    const [localSettings, setLocalSettings] = useState<POSSettings | null>(null);

    const { data: allTerminals = [], isLoading, isError, error } = useQuery({
        queryKey: ["all-pos-settings"],
        queryFn: async () => {
            const res = await getAllPosSettings();
            return res.data.data as Terminal[];
        }
    });

    // When a terminal is picked from the list
    const handlePickTerminal = (terminal: Terminal) => {
        setSelectedTerminal(terminal);
        setLocalSettings(terminal.settings);
    };

    const mutation = useMutation({
        mutationFn: (data: POSSettings) => updatePosSettings(selectedTerminal!.id, data),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["all-pos-settings"] });
            enqueueSnackbar("Settings saved successfully!", { variant: "success" });
            
            // If the terminal we just updated is the one we are currently using, update Zustand state
            if (currentActiveTerminal && selectedTerminal && currentActiveTerminal.id === selectedTerminal.id) {
                const updatedTerminal = {
                    ...selectedTerminal,
                    settings: res.data.data
                };
                setSelectedPOSPoint(updatedTerminal);
            }
        },
        onError: () => {
            enqueueSnackbar("Failed to save settings", { variant: "error" });
        }
    });

    const handleToggle = (field: string) => {
        setLocalSettings(prev => prev ? ({ ...prev, [field]: !prev[field] }) : null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => prev ? ({ ...prev, [name]: value }) : null);
    };

    const handleSave = () => {
        if (localSettings) {
            mutation.mutate(localSettings);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-[var(--bg-main)] h-screen flex items-center justify-center text-[var(--text-main)] font-black uppercase tracking-widest opacity-20">
                Synchronizing Terminals...
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-[var(--bg-main)] h-screen flex flex-col items-center justify-center text-[var(--text-main)] p-10 text-center">
                <h2 className="text-red-500 font-black uppercase text-2xl mb-4">Sync Error</h2>
                <p className="text-[var(--text-muted)] text-sm mb-6">{(error as any)?.message || "Failed to sync terminal settings"}</p>
                <BackButton />
            </div>
        );
    }

    return (
        <section className="bg-[var(--bg-main)] h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 md:px-10 py-6 md:py-8">
                <div className="flex items-center gap-4">
                    <BackButton />
                    <div>
                        <h1 className="text-[var(--text-main)] text-2xl font-black uppercase tracking-tighter">
                            POS Settings
                        </h1>
                        <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mt-1">Configure your terminal hardware and workflow</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden px-6 md:px-10 pb-24 lg:pb-10 flex flex-col lg:flex-row gap-6 md:gap-8">

                {/* Left Side: Terminal List */}
                <div className="w-full lg:w-1/3 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-main)] flex flex-col overflow-hidden max-h-[300px] lg:max-h-full">
                    <div className="p-5 border-b border-[var(--border-main)] bg-[var(--bg-card-alt)]/30">
                        <h2 className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <FaTerminal className="text-[var(--primary)]" /> Registered Terminals
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                        {allTerminals.map((term: Terminal) => (
                            <button
                                key={term.id}
                                onClick={() => handlePickTerminal(term)}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${selectedTerminal?.id === term.id
                                        ? "bg-[var(--primary)] text-black shadow-lg shadow-[var(--primary)]/10"
                                        : "bg-[var(--bg-main)] border-transparent text-[var(--text-main)] hover:border-[var(--primary)]/30"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${selectedTerminal?.id === term.id ? "bg-black/10" : "bg-[var(--bg-card-alt)]"}`}>
                                        <FaTerminal className={selectedTerminal?.id === term.id ? "text-black" : "text-[var(--primary)]"} />
                                    </div>
                                    <div className="text-start">
                                        <p className="text-sm font-black uppercase tracking-tight leading-none">{term.name}</p>
                                        <p className={`text-[8px] font-bold mt-1 ${selectedTerminal?.id === term.id ? "text-black/60" : "text-[var(--text-dim)]"}`}>ID: {term.code}</p>
                                    </div>
                                </div>
                                <FaChevronRight size={10} className={selectedTerminal?.id === term.id ? "opacity-40" : "text-[var(--border-main)] rtl:rotate-180"} />
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
                                <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-main)] flex-1 overflow-y-auto custom-scrollbar shadow-2xl relative flex flex-col">
                                    
                                    {/* Sub-Header */}
                                    <div className="sticky top-0 z-10 bg-[var(--bg-card)]/80 backdrop-blur-md p-6 border-b border-[var(--border-main)] flex items-center justify-between">
                                        <div>
                                            <h2 className="text-[var(--text-main)] text-xl font-black uppercase tracking-tighter">{selectedTerminal.name}</h2>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[var(--primary)] text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                                    <FaCheckCircle size={10} /> Configuration Mode
                                                </span>
                                                <span className="w-1 h-1 bg-[var(--border-main)] rounded-full"></span>
                                                <span className="text-[var(--text-dim)] text-[9px] font-bold uppercase tracking-widest">Code: {selectedTerminal.code}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleSave}
                                            disabled={mutation.isPending}
                                            className="bg-[var(--primary)] text-black px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-[var(--primary-hover)] transition-all shadow-lg shadow-[var(--primary)]/10 disabled:opacity-50 disabled:grayscale"
                                        >
                                            <FaSave /> {mutation.isPending ? "Saving..." : "Save Changes"}
                                        </button>
                                    </div>

                                    <div className="p-8 space-y-10">
                                        
                                        {/* Hardware & Printing Section */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 border-s-2 border-[var(--primary)] ps-4">
                                                <FaPrint className="text-[var(--primary)]" size={14} />
                                                <h3 className="text-[var(--text-main)] text-xs font-black uppercase tracking-[0.2em]">Hardware & Printing</h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-[var(--bg-main)] p-5 rounded-2xl border border-[var(--border-main)] flex items-center justify-between group hover:border-[var(--primary)]/30 transition-all">
                                                    <div>
                                                        <span className="text-[10px] text-[var(--text-main)] font-black uppercase tracking-widest block">Auto-Print Receipt</span>
                                                        <p className="text-[9px] text-[var(--text-dim)] mt-1 font-medium">Prints receipt automatically after payment</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleToggle('autoPrintReceipt')}
                                                        className={`w-10 h-5 rounded-full relative transition-all ${localSettings.autoPrintReceipt ? 'bg-[var(--primary)]' : 'bg-[var(--border-main)]'}`}
                                                    >
                                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${localSettings.autoPrintReceipt ? 'end-1' : 'start-1'}`} />
                                                    </button>
                                                </div>

                                                <div className="bg-[var(--bg-main)] p-5 rounded-2xl border border-[var(--border-main)] flex items-center justify-between group hover:border-[var(--primary)]/30 transition-all">
                                                    <div>
                                                        <span className="text-[10px] text-[var(--text-main)] font-black uppercase tracking-widest block">Direct Print</span>
                                                        <p className="text-[9px] text-[var(--text-dim)] mt-1 font-medium">Bypass print preview and print immediately</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleToggle('directPrint')}
                                                        className={`w-10 h-5 rounded-full relative transition-all ${localSettings.directPrint ? 'bg-[var(--primary)]' : 'bg-[var(--border-main)]'}`}
                                                    >
                                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${localSettings.directPrint ? 'end-1' : 'start-1'}`} />
                                                    </button>
                                                </div>

                                                <div className="bg-[var(--bg-main)] p-5 rounded-2xl border border-[var(--border-main)] space-y-3 group hover:border-[var(--primary)]/30 transition-all">
                                                    <label className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest block">Receipt Printer</label>
                                                    <input
                                                        type="text"
                                                        name="receiptPrinterName"
                                                        value={localSettings.receiptPrinterName || ""}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter printer name..."
                                                        className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl px-4 py-2.5 text-[var(--text-main)] text-xs font-bold focus:outline-none focus:border-[var(--primary)] transition-colors"
                                                    />
                                                </div>

                                                <div className="bg-[var(--bg-main)] p-5 rounded-2xl border border-[var(--border-main)] space-y-3 group hover:border-[var(--primary)]/30 transition-all">
                                                    <label className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest block">Kitchen Printer</label>
                                                    <input
                                                        type="text"
                                                        name="kitchenPrinterName"
                                                        value={localSettings.kitchenPrinterName || ""}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter printer name..."
                                                        className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl px-4 py-2.5 text-[var(--text-main)] text-xs font-bold focus:outline-none focus:border-[var(--primary)] transition-colors"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Flow & Validation Section */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 border-s-2 border-[var(--primary)] ps-4">
                                                <FaUserCheck className="text-[var(--primary)]" size={14} />
                                                <h3 className="text-[var(--text-main)] text-xs font-black uppercase tracking-[0.2em]">Order Flow & Rules</h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-[var(--bg-main)] p-5 rounded-2xl border border-[var(--border-main)] flex items-center justify-between group hover:border-[var(--primary)]/30 transition-all">
                                                    <div>
                                                        <span className="text-[10px] text-[var(--text-main)] font-black uppercase tracking-widest block">Mandatory Customer</span>
                                                        <p className="text-[9px] text-[var(--text-dim)] mt-1 font-medium">Require customer info before taking order</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleToggle('requireCustomerOnOrder')}
                                                        className={`w-10 h-5 rounded-full relative transition-all ${localSettings.requireCustomerOnOrder ? 'bg-[var(--primary)]' : 'bg-[var(--border-main)]'}`}
                                                    >
                                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${localSettings.requireCustomerOnOrder ? 'end-1' : 'start-1'}`} />
                                                    </button>
                                                </div>

                                                <div className="bg-[var(--bg-main)] p-5 rounded-2xl border border-[var(--border-main)] flex items-center justify-between group hover:border-[var(--primary)]/30 transition-all">
                                                    <div>
                                                        <span className="text-[10px] text-[var(--text-main)] font-black uppercase tracking-widest block">Allow Discounts</span>
                                                        <p className="text-[9px] text-[var(--text-dim)] mt-1 font-medium">Enable discount field on the cart</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleToggle('allowDiscounts')}
                                                        className={`w-10 h-5 rounded-full relative transition-all ${localSettings.allowDiscounts ? 'bg-[var(--primary)]' : 'bg-[var(--border-main)]'}`}
                                                    >
                                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${localSettings.allowDiscounts ? 'end-1' : 'start-1'}`} />
                                                    </button>
                                                </div>

                                                <div className="bg-[var(--bg-main)] p-5 rounded-2xl border border-[var(--border-main)] flex items-center justify-between group hover:border-[var(--primary)]/30 transition-all">
                                                    <div>
                                                        <span className="text-[10px] text-[var(--text-main)] font-black uppercase tracking-widest block">Enable Tables</span>
                                                        <p className="text-[9px] text-[var(--text-dim)] mt-1 font-medium">Show table selection for Dine-in orders</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleToggle('enableTables')}
                                                        className={`w-10 h-5 rounded-full relative transition-all ${localSettings.enableTables !== false ? 'bg-[var(--primary)]' : 'bg-[var(--border-main)]'}`}
                                                    >
                                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${localSettings.enableTables !== false ? 'end-1' : 'start-1'}`} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Advanced Features Section */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 border-s-2 border-[var(--primary)] ps-4">
                                                <FaChevronRight className="text-[var(--primary)]" size={14} />
                                                <h3 className="text-[var(--text-main)] text-xs font-black uppercase tracking-[0.2em]">Advanced Features</h3>
                                            </div>

                                            <div className="bg-[var(--bg-main)] p-5 rounded-2xl border border-[var(--border-main)] flex items-center justify-between group hover:border-[var(--primary)]/30 transition-all">
                                                <div>
                                                    <span className="text-[10px] text-[var(--text-main)] font-black uppercase tracking-widest block">Quick Menu Startup</span>
                                                    <p className="text-[9px] text-[var(--text-dim)] mt-1 font-medium">Bypass home screen and open directly to menu on login</p>
                                                </div>
                                                <button
                                                    onClick={() => handleToggle('openOnMenu')}
                                                    className={`w-10 h-5 rounded-full relative transition-all ${localSettings.openOnMenu ? 'bg-[var(--primary)]' : 'bg-[var(--border-main)]'}`}
                                                >
                                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${localSettings.openOnMenu ? 'end-1' : 'start-1'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Extra spacing at bottom */}
                                    <div className="h-20 shrink-0"></div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full bg-[var(--bg-card)] rounded-3xl border border-[var(--border-main)] border-dashed flex flex-col items-center justify-center p-10 text-center opacity-30">
                                <div className="w-20 h-20 bg-[var(--bg-main)] rounded-full flex items-center justify-center mb-6">
                                    <FaTerminal size={32} className="text-[var(--primary)]" />
                                </div>
                                <h2 className="text-[var(--text-main)] text-xl font-black uppercase tracking-tighter mb-2">Configure Terminal</h2>
                                <p className="text-[var(--text-dim)] text-[10px] uppercase tracking-[0.2em] max-w-[200px]">Select a register from the left panel to begin configuration</p>
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
