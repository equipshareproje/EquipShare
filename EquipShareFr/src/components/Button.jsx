import React from 'react';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'font-semibold rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-accent hover:bg-primary text-white focus:ring-accent',
    secondary: 'bg-surface border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
    outline: 'bg-white text-primary hover:bg-primary-light hover:text-white border border-white focus:ring-primary',
    text: 'text-primary hover:text-primary-dark focus:ring-primary-dark',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-lg',
  };

  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${disabledStyles}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
