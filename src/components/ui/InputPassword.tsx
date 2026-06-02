import React, { forwardRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn';

interface InputPasswordProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const InputPassword = forwardRef<HTMLInputElement, InputPasswordProps>(
  ({ label, error, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="flex flex-col gap-1 w-full">
        {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
        <div className="relative">
          <input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={cn(
              "w-full px-3 py-2 pr-10 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400",
              "focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
              "disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200 disabled:shadow-none",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              className
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
      </div>
    );
  }
);
InputPassword.displayName = 'InputPassword';
