import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="#635bff" />
      <path d="M30 70V30H50C55.5228 30 60 34.4772 60 40C60 45.5228 55.5228 50 50 50H40" stroke="white" strokeWidth="6" strokeLinecap="round" />
      <path d="M40 50H60C65.5228 50 70 54.4772 70 60C70 65.5228 65.5228 70 60 70H30" stroke="white" strokeWidth="6" strokeLinecap="round" />
      <path d="M50 30V70" stroke="white" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
};

export default Logo;