
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export default function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  const baseStyles = 'whitespace-nowrap cursor-pointer font-medium transition-all duration-300 inline-flex items-center justify-center';
  
  const variants = {
    primary: 'bg-[#D4AF37] text-[#1A1A1A] hover:bg-[#C19B2E]',
    secondary: 'bg-[#1A1A1A] text-white hover:bg-[#2A2A2A]',
    outline: 'border-2 border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white',
    ghost: 'text-[#1A1A1A] hover:bg-[#F5F5F5]'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
