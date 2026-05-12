import React from 'react'
import { IoArrowBackOutline } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'

const BackButton = () => {

    const navigate = useNavigate();

  return (
    <button onClick={() => navigate(-1)} className='bg-[var(--bg-card-alt)] p-2 text-xl font-bold rounded-full text-[var(--text-main)] border border-[var(--border-main)] hover:bg-[var(--bg-hover)] transition-all'> 
        <IoArrowBackOutline />
    </button>
  )
}

export default BackButton