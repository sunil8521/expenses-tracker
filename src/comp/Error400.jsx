import React from 'react'

const Error400 = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
    <div className="flex items-center space-x-4">
      <span className="text-4xl font-light">404</span>
      <div className="w-px h-8 bg-white/25"></div>
      <span className="text-lg">This page could not be found.</span>
    </div>
  </div>
  )
}

export default Error400
