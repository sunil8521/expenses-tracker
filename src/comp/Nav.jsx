import React from 'react'
import { PlusCircle, MinusCircle, ArrowUpRight, ArrowDownRight, Home, PieChart, Settings, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';


const Nav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-4">
      
      <Link to="/" className="flex flex-col items-center">
          <Home className="w-6 h-6" />
          <span className="text-xs mt-1">Home</span>
      </Link>
      
      <Link to="/reports" className="flex flex-col items-center">
          <PieChart className="w-6 h-6" />
          <span className="text-xs mt-1">Reports</span>
      </Link>
      
      <Link to="/settings" className="flex flex-col items-center">
          <Settings className="w-6 h-6" />
          <span className="text-xs mt-1">Settings</span>
      </Link>
      
    </nav>
  )
}

export default Nav
