import React from 'react'
import Navbar from '../components/Navbar'

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="p-6">{children}</main>
    </div>
  )
}

export default MainLayout
