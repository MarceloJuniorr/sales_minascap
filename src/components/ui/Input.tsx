import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`border rounded p-2 w-full text-gray-800 ${className}`}
      {...props}
    />
  );
}
