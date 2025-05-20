import React from 'react';

interface FAIconProps {
  icon: string;
  className?: string;
  style?: React.CSSProperties;
}

const FAIcon: React.FC<FAIconProps> = ({ icon, className = '', style = {} }) => {
  return (
    <i className={`${icon} ${className}`} style={style}></i>
  );
};

export default FAIcon;