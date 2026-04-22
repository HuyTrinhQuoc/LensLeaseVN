import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  error?: string;
}

/**
 * Input component chuẩn hoá với label và error message.
 */
export default function Input({
  label,
  icon,
  error,
  className = '',
  id,
  ...rest
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`input-group ${error ? 'input-group--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-group__label">
          {label}
        </label>
      )}
      <div className="input-group__wrap">
        {icon && (
          <span className="material-symbols-outlined input-group__icon">{icon}</span>
        )}
        <input id={inputId} className="input-group__field" {...rest} />
      </div>
      {error && <p className="input-group__error">{error}</p>}
    </div>
  );
}
