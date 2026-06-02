import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">BolãoBet</h1>
          <p className="text-blue-600 mt-2 font-medium">O seu sistema de apostas</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
