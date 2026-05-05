import React from 'react';
import './Skeleton.css';

const Skeleton = ({ type = 'text', width, height, borderRadius }) => {
  const style = {
    width: width || (type === 'text' ? '100%' : '100%'),
    height: height || (type === 'text' ? '1rem' : '200px'),
    borderRadius: borderRadius || (type === 'circle' ? '50%' : '8px'),
  };

  return <div className={`skeleton skeleton-${type}`} style={style} />;
};

export default Skeleton;
