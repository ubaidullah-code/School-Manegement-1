import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

const StatCard = ({ title, value, icon, className }) => {
  const cardRef = useRef(null);
  const valueRef = useRef(null);
  
  useEffect(() => {
    if (valueRef.current) {
      gsap.from(valueRef.current, {
        textContent: 0,
        duration: 1.5,
        ease: "power2.out",
        snap: { textContent: 1 },
        onUpdate: function() {
          valueRef.current.textContent = Math.round(this.targets()[0].textContent);
        }
      });
    }
    
    if (cardRef.current) {
      cardRef.current.addEventListener('mouseenter', () => {
        gsap.to(cardRef.current, {
          y: -5,
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          duration: 0.3
        });
      });
      
      cardRef.current.addEventListener('mouseleave', () => {
        gsap.to(cardRef.current, {
          y: 0,
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          duration: 0.3
        });
      });
    }
  }, [value]);
  
  return (
    <div 
      ref={cardRef}
      className={`bg-white rounded-xl shadow-md p-6 transition-all ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p ref={valueRef} className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;