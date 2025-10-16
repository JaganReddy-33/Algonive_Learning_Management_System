// src/components/ui/Button.jsx
import React from 'react';

export const Button = ({ children, onClick, variant }) => {
  const base = "px-4 py-2 rounded font-medium";
  const style =
    variant === 'destructive'
      ? "bg-red-500 text-white hover:bg-red-600"
      : "border border-gray-500 text-gray-700 hover:bg-gray-100";
  return (
    <button className={`${base} ${style}`} onClick={onClick}>
      {children}
    </button>
  );
};
