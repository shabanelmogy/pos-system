import React from 'react'

const MiniCard = ({title, icon, number, footerNum}) => {
  return (
    <div className='bg-[#1a1a1a] py-3 px-4 rounded-lg w-full sm:w-[50%]'>
        <div className='flex items-start justify-between'>
            <h1 className='text-[#f5f5f5] text-base font-semibold tracking-wide'>{title}</h1>
            <button className={`${title === "Total Earnings" ? "bg-[#02ca3a]" : "bg-[#f6b100]"} p-2 rounded-lg text-[#f5f5f5] text-xl`}>{icon}</button>
        </div>
        <div>
            <h1 className='text-[#f5f5f5] text-2xl font-bold mt-3'>{
              title === "Total Earnings" ? `₹${number}` : number}</h1>
            <h1 className='text-[#f5f5f5] text-xs mt-1'><span className='text-[#02ca3a]'>{footerNum}%</span> than yesterday</h1>
        </div>
    </div>
  )
}

export default MiniCard