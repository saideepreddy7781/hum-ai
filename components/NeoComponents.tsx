import React, { ReactNode } from 'react';

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  children: ReactNode;
}

export const NeoButton: React.FC<NeoButtonProps> = ({ variant = 'primary', children, className = '', ...props }) => {
  const baseStyle = "px-6 py-3 font-bold border-2 border-neo-black dark:border-neo-white transition-all transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";
  
  let colorStyle = "";
  switch (variant) {
    case 'primary': colorStyle = "bg-g-blue text-white shadow-neo dark:shadow-neo-dark hover:-translate-y-1 hover:translate-x-0"; break;
    case 'secondary': colorStyle = "bg-white dark:bg-neo-black text-neo-black dark:text-white shadow-neo dark:shadow-neo-dark hover:-translate-y-1"; break;
    case 'danger': colorStyle = "bg-g-red text-white shadow-neo dark:shadow-neo-dark hover:-translate-y-1"; break;
    case 'success': colorStyle = "bg-g-green text-white shadow-neo dark:shadow-neo-dark hover:-translate-y-1"; break;
  }

  return (
    <button className={`${baseStyle} ${colorStyle} ${className}`} {...props}>
      {children}
    </button>
  );
};

interface NeoCardProps {
  children: ReactNode;
  className?: string;
  color?: string;
}

export const NeoCard: React.FC<NeoCardProps> = ({ children, className = '', color = 'bg-white' }) => {
  return (
    <div className={`border-2 border-neo-black dark:border-neo-white shadow-neo dark:shadow-neo-dark p-6 ${color} dark:bg-gray-800 dark:text-white ${className}`}>
      {children}
    </div>
  );
};

export const NeoInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
  return (
    <input
      {...props}
      className={`w-full border-2 border-neo-black dark:border-neo-white p-3 outline-none focus:shadow-neo dark:focus:shadow-neo-dark transition-shadow bg-white dark:bg-gray-900 dark:text-white ${props.className || ''}`}
    />
  );
};

export const NeoTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => {
  return (
    <textarea
      {...props}
      className={`w-full border-2 border-neo-black dark:border-neo-white p-3 outline-none focus:shadow-neo dark:focus:shadow-neo-dark transition-shadow bg-white dark:bg-gray-900 dark:text-white ${props.className || ''}`}
    />
  );
};
