import React from 'react';

function Loader() {
  return (
    <div className='spinner-parent'>
      <div 
        className="spinner-border" 
        role="status" 
        aria-hidden="true"
      >
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}

export default Loader;
