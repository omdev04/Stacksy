import React from 'react';

interface AvatarProps {
  username: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({ username, color, size = 'md' }) => {
  const getInitials = (name: string) => {
    const capitals = name.replace(/[^A-Z]/g, '');
    if (capitals.length >= 2) return capitals.slice(0, 2);
    return name.slice(0, 2).toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-10 h-10 text-[13px]',
    lg: 'w-16 h-16 text-[20px]',
  };

  
  const getTextColor = (hex: string) => {
    const c = hex.substring(1);
    const rgb = parseInt(c, 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma > 160 ? '#141414' : '#ffffff';
  };

  const initials = getInitials(username);
  const textColor = getTextColor(color);

  return (
    <div
      className={`${sizeClasses[size]} rounded-brand-md flex items-center justify-center font-bold select-none flex-shrink-0`}
      style={{ backgroundColor: color, color: textColor }}
      title={username}
    >
      {initials}
    </div>
  );
};
