import React from 'react';
import Cleave from 'cleave.js/react';
import 'cleave.js/dist/addons/cleave-phone.i18n.js'; // Adicione esta linha


interface CleaveInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Opções de máscara para o Cleave.js */
  options: any;
}

export const CleaveInput = React.forwardRef<HTMLInputElement, CleaveInputProps>(
  ({ options, className = "", ...props }, ref) => {
    return (
      <Cleave
        {...props}
        options={options}
        // Para encaminhar a referência para o input
        htmlRef={ref as any}
        className={`border rounded p-2 w-full text-gray-800 ${className}`}
      />
    );
  }
);

CleaveInput.displayName = "CleaveInput";