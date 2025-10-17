import Image from "next/image";
import React from "react";

interface CardProps {
  children: React.ReactNode;
  icon: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const Card = ({
  children,
  icon,
  title,
  subtitle,
  className = "",
}: CardProps) => {
  return (
    <div className={`card-with-icon-cutout p-6 pt-16 ${className}`}>
      <div className="card-icon-wrapper">
        <div className="card-icon">
          <Image src={icon} alt={title || ""} width={44} height={44} />
        </div>
      </div>

      {(title || subtitle) && (
        <div className="text-center mb-6 flex flex-col items-center justify-center gap-2">
          {title && <h2 className="text-2xl font-bold">{title}</h2>}
          {subtitle && <p className="text-secondary">{subtitle}</p>}
        </div>
      )}

      {children}
    </div>
  );
};
