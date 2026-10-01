'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export default function Card({ children, className = '', onClick, hoverable = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg 
        shadow-[0_2px_8px_rgba(44,62,80,0.08)]
        ${hoverable ? 'cursor-pointer transition-all duration-200 hover:shadow-[0_4px_16px_rgba(44,62,80,0.12)] hover:scale-[1.02]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
