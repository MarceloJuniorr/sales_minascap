import React from "react";

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = "", ...props }: CardContentProps) {
  return (
    <div className={` ${className}`} {...props}>
      {children}
    </div>
  );
}
