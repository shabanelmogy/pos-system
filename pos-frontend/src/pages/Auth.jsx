import React, { useEffect, useState } from "react";
import restaurant from "../assets/images/restaurant-img.jpg"
import logo from "../assets/images/logo.png"
import Register from "../components/auth/Register";
import Login from "../components/auth/Login";
import { motion, AnimatePresence } from "framer-motion";

const Auth = () => {
  useEffect(() => {
    document.title = "RestroPOS | Enterprise Secure Login"
  }, [])

  const [isRegister, setIsRegister] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-[#0f0f0f] overflow-hidden">
      {/* Visual Experience Section */}
      <div className="hidden lg:flex lg:w-3/5 relative items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img className="w-full h-full object-cover grayscale-[0.3]" src={restaurant} alt="Experience" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
        </motion.div>

        <div className="relative z-10 px-20 max-w-3xl">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#f6b100] text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8">
              <span className="w-2 h-2 bg-black rounded-full animate-pulse"></span>
              Enterprise POS v2.0
            </div>
            <h1 className="text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase mb-6">
              Precision <br />
              <span className="text-[#f6b100]">Performance</span> <br />
              Profitability.
            </h1>
            <p className="text-[#ababab] text-lg font-medium max-w-lg leading-relaxed">
              The world's most intuitive point of sale architecture, designed for high-volume enterprise environments. 
              Manage multiple branches, terminals, and your workforce from a single secure gateway.
            </p>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-16 flex items-center gap-8"
          >
             <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-black bg-[#262626] flex items-center justify-center overflow-hidden">
                     <div className="w-full h-full bg-[#333]" />
                  </div>
                ))}
             </div>
             <p className="text-[10px] text-[#555] font-black uppercase tracking-widest leading-tight">
                Trusted by 5,000+ <br /> global locations
             </p>
          </motion.div>
        </div>

        {/* Decorative Element */}
        <div className="absolute bottom-20 left-20 w-40 h-1 bg-[#f6b100]"></div>
      </div>

      {/* Authentication Section */}
      <div className="w-full lg:w-2/5 min-h-screen flex flex-col justify-center px-8 md:px-20 relative bg-[#0f0f0f]">
        <div className="absolute top-12 left-8 md:left-20 flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="bg-[#f6b100] p-2 rounded-xl"
          >
            <img src={logo} alt="Logo" className="h-6 w-6 brightness-0" />
          </motion.div>
          <span className="text-white font-black uppercase tracking-tighter text-xl">Restro<span className="text-[#f6b100]">POS</span></span>
        </div>

        <div className="max-w-md w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={isRegister ? "register" : "login"}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-10">
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
                  {isRegister ? "Join the Force" : "Secure Entry"}
                </h2>
                <p className="text-[#555] font-bold uppercase tracking-widest text-[10px]">
                  {isRegister ? "Create your professional staff account" : "Enter your credentials to access the terminal"}
                </p>
              </div>

              {isRegister ? <Register setIsRegister={setIsRegister} /> : <Login />}

              <div className="mt-10 flex flex-col items-center gap-6">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[#222] to-transparent"></div>
                <p className="text-[11px] text-[#ababab] font-bold uppercase tracking-widest">
                  {isRegister ? "Part of the team already?" : "Authorized personnel only."}
                  <button 
                    onClick={() => setIsRegister(!isRegister)} 
                    className="ml-2 text-[#f6b100] hover:text-white transition-colors underline underline-offset-4"
                  >
                    {isRegister ? "Sign in instead" : "Request access"}
                  </button>
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute bottom-10 left-0 right-0 text-center">
           <p className="text-[9px] text-[#333] font-black uppercase tracking-[0.4em]">
             &copy; 2026 RestroPOS Enterprise Logic. All rights reserved.
           </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
