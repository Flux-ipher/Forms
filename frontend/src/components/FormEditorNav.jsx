import React from 'react';
import { NavLink, useParams } from 'react-router-dom';

export default function FormEditorNav() {
  const { id } = useParams();
  
  return (
    <div className="flex justify-center border-b border-gray-200 bg-white sticky top-16 z-40 mb-8 pt-4">
      <nav className="flex space-x-8">
        <NavLink 
          to={`/build/${id}`}
          className={({ isActive }) => `py-4 px-1 border-b-2 font-medium text-sm transition-colors ${isActive ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          Questions
        </NavLink>
        <NavLink 
          to={`/analytics/${id}`}
          className={({ isActive }) => `py-4 px-1 border-b-2 font-medium text-sm transition-colors ${isActive ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          Responses
        </NavLink>
        <NavLink 
          to={`/settings/${id}`}
          className={({ isActive }) => `py-4 px-1 border-b-2 font-medium text-sm transition-colors ${isActive ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          Settings
        </NavLink>
      </nav>
    </div>
  );
}
