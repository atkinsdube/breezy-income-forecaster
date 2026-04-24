import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const variantClass = variant === 'primary' ? 'button-primary' : 'button-secondary';
  return <button className={`button ${variantClass} ${className}`} {...props} />;
}
