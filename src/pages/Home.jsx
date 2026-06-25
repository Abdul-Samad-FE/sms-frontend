import React from 'react';

const Home = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 bg-white shadow-xl rounded-2xl border border-gray-100 max-w-lg w-full">
        <h1 className="text-4xl font-extrabold text-indigo-600 mb-4 tracking-tight">
          School Management System
        </h1>
        <p className="text-gray-500 mb-8 text-lg">
          Welcome to the central dashboard. Operations are running smoothly.
        </p>
        <button className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 hover:shadow-lg transition duration-200">
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Home;
