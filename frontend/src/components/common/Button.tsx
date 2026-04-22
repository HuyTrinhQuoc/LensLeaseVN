import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'surface' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  loading?: boolean;
}

/**
 * Button component chuẩn hoá cho toàn ứng dụng.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  const baseClass = `dashboard-btn-${variant}`;
  const sizeClass = size === 'lg' ? 'btn--lg' : size === 'sm' ? 'btn--sm' : '';

  return (
    <button
      className={`${baseClass} ${sizeClass} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>
          progress_activity
        </span>
      ) : icon ? (
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  );
}
