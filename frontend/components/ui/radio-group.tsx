import React from 'react';

interface RadioGroupProps {
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ onValueChange, children }) => {
  return (
    <div onChange={(e: any) => onValueChange(e.target.value)}>
      {children}
    </div>
  );
};

interface RadioGroupItemProps {
  value: string;
  id: string;
}

export const RadioGroupItem: React.FC<RadioGroupItemProps> = ({ value, id }) => {
  return <input type="radio" value={value} id={id} className="mr-2" />;
};