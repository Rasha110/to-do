import React from 'react';

type Props={
  type?:     'submit' ;
  children: React.ReactNode;
  className?: string;
  onClick?:   ()=> void;
};

const Button: React.FC<Props>=({type='submit',children,className,onClick })=>{
  return (
    <button type={type} onClick={onClick} className={`flex items-center justify-center ${className}`} >{children}</button>
  );
};

export default Button;