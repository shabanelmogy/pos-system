import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import CustomDropdown from "../../../../../shared/components/CustomDropdown";
import { 
  MdPerson, MdEmail, MdPhone, MdLock, MdShield, MdStore, MdComputer 
} from "react-icons/md";
import { IoMdArrowDropdown } from "react-icons/io";

interface UserFormProps {
  register: any;
  errors: any;
  watch: any;
  setValue: any;
  branches: any[];
  branchPOSPoints: any[];
  selectedPOSPoints: string[];
  togglePOSSelection: (id: string) => void;
  showTerminals: boolean;
  setShowTerminals: (show: boolean) => void;
  posSearchQuery: string;
  setPosSearchQuery: (query: string) => void;
  firstInputRef: any;
  isEdit: boolean;
  localize: (val: any) => string;
  t: any;
}

export const UserForm: React.FC<UserFormProps> = ({
  register,
  errors,
  watch,
  setValue,
  branches,
  branchPOSPoints,
  selectedPOSPoints,
  togglePOSSelection,
  showTerminals,
  setShowTerminals,
  posSearchQuery,
  setPosSearchQuery,
  firstInputRef,
  isEdit,
  localize,
  t,
}) => {
  const watchedBranchId = watch("branchId");
  const watchedRole = watch("role");

  return (
    <div className="space-y-8">
      {/* Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="group">
            <label className="flex items-center gap-2 text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-2 px-1">
              <MdPerson /> {t("dashboard.management.modal.full_name")}
            </label>
            <input
              {...register("name")}
              ref={(e) => {
                register("name").ref(e);
                if (e) firstInputRef.current = e;
              }}
              type="text"
              className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all font-bold text-sm shadow-inner"
            />
            {errors.name && (
              <span className="text-[9px] text-red-500 font-bold mt-2 block">
                {errors.name.message as string}
              </span>
            )}
          </div>
          <div className="group">
            <label className="flex items-center gap-2 text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-2 px-1">
              <MdEmail /> {t("dashboard.management.modal.email")}
            </label>
            <input
              {...register("email")}
              type="email"
              className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all text-sm font-bold shadow-inner"
            />
            {errors.email && (
              <span className="text-[9px] text-red-500 font-bold mt-2 block">
                {errors.email.message as string}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="group">
            <label className="flex items-center gap-2 text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-2 px-1">
              <MdPhone /> {t("dashboard.management.modal.phone")}
            </label>
            <input
              {...register("phone")}
              type="text"
              className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all text-sm font-bold shadow-inner"
            />
            {errors.phone && (
              <span className="text-[9px] text-red-500 font-bold mt-2 block">
                {errors.phone.message as string}
              </span>
            )}
          </div>
          <div className="group">
            <label className="flex items-center gap-2 text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-2 px-1">
              <MdLock />{" "}
              {isEdit
                ? t("dashboard.management.modal.new_password")
                : t("dashboard.management.modal.security_password")}
            </label>
            <input
              {...register("password")}
              type="password"
              placeholder={isEdit ? t("dashboard.management.modal.optional") : ""}
              className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all text-sm font-bold shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Role & Branch */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--bg-card)]/50 p-6 rounded-3xl border border-[var(--border-main)]">
        <div className="group">
          <label className="flex items-center gap-2 text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-2 px-1">
            <MdShield /> {t("dashboard.management.modal.role")}
          </label>
          <CustomDropdown
            options={[
              { id: "cashier", name: t("dashboard.management.modal.roles.cashier") },
              { id: "manager", name: t("dashboard.management.modal.roles.manager") },
              { id: "admin", name: t("dashboard.management.modal.roles.admin") },
              { id: "kitchen", name: "Kitchen Staff" },
            ]}
            value={watchedRole}
            onChange={(val: any) => setValue("role", val)}
            placeholder={t("dashboard.management.modal.select_role")}
          />
        </div>
        <div className="group">
          <label className="flex items-center gap-2 text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest mb-2 px-1">
            <MdStore /> {t("dashboard.management.modal.assigned_branch")}
          </label>
          <CustomDropdown
            options={(branches || []).map((b: any) => ({
              id: b.id,
              name: localize(b.name),
            }))}
            value={watchedBranchId}
            onChange={(val: any) => setValue("branchId", val)}
            placeholder={t("dashboard.management.modal.select_branch")}
          />
        </div>
      </div>

      {/* Collapsible Terminal Section */}
      {watchedBranchId && (
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            showTerminals ? "max-h-[800px] opacity-100" : "max-h-20 opacity-90"
          }`}
        >
          <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-main)] overflow-hidden shadow-2xl">
            <button
              type="button"
              onClick={() => setShowTerminals(!showTerminals)}
              className="w-full px-8 py-5 flex items-center justify-between hover:bg-[var(--bg-card-alt)] transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    showTerminals
                      ? "bg-[var(--primary)]/20 text-[var(--primary)]"
                      : "bg-[var(--text-dim)]/10 text-[var(--text-dim)]"
                  }`}
                >
                  <MdComputer size={20} />
                </div>
                <div className="text-left">
                  <p className="text-[var(--text-main)] text-xs font-black uppercase tracking-widest leading-none mb-1">
                    Terminal Restrictions
                  </p>
                  <p className="text-[var(--text-dim)] text-[10px] font-bold">
                    {selectedPOSPoints.length > 0
                      ? "1 Terminal Linked"
                      : "No Terminals Assigned"}
                  </p>
                </div>
              </div>
              <div
                className={`transition-transform duration-300 ${
                  showTerminals ? "rotate-180" : ""
                }`}
              >
                <IoMdArrowDropdown size={24} />
              </div>
            </button>

            <AnimatePresence>
              {showTerminals && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-8 pb-8 space-y-6 overflow-hidden"
                >
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="Search terminals..."
                      value={posSearchQuery}
                      onChange={(e) => setPosSearchQuery(e.target.value)}
                      className="w-full bg-[var(--bg-card-alt)] border border-[var(--border-main)] rounded-2xl px-5 py-4 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all font-bold placeholder:text-[var(--text-dim)] shadow-inner"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    {(branchPOSPoints || [])
                      .filter(
                        (pos: any) =>
                          pos.name.toLowerCase().includes(posSearchQuery.toLowerCase()) ||
                          pos.code.toLowerCase().includes(posSearchQuery.toLowerCase())
                      )
                      .map((pos: any) => (
                        <label
                          key={pos.id}
                          className={`flex items-center gap-4 cursor-pointer group p-4 rounded-2xl border-2 transition-all ${
                            selectedPOSPoints.includes(pos.id)
                              ? "bg-[var(--primary)]/5 border-[var(--primary)]"
                              : "bg-transparent border-[var(--border-main)] hover:border-[var(--text-dim)]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="posSelection"
                            checked={selectedPOSPoints.includes(pos.id)}
                            onChange={() => togglePOSSelection(pos.id)}
                            className="w-4 h-4 text-[var(--primary)] focus:ring-[var(--primary)] bg-[var(--bg-card-alt)] border-[var(--border-main)]"
                          />
                          <div className="flex flex-col">
                            <span
                              className={`text-[10px] font-black uppercase tracking-tight leading-none mb-1 ${
                                selectedPOSPoints.includes(pos.id)
                                  ? "text-[var(--primary)]"
                                  : "text-[var(--text-muted)] group-hover:text-[var(--text-main)]"
                              }`}
                            >
                              {pos.name}
                            </span>
                            <span className="text-[8px] text-[var(--text-dim)] font-bold">
                              {pos.code}
                            </span>
                          </div>
                        </label>
                      ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};
