import React from 'react'

const Error500 = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="flex items-center space-x-4">
        <span className="text-4xl font-light">500</span>
        <div className="w-px h-8 bg-white/25"></div>
        <span className="text-lg">Oops! Something went wrong on our end.</span>
      </div>
    </div>
  )
}

export default Error500
