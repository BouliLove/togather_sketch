import React, { useRef, useEffect } from 'react';
import rough from 'roughjs';

const SketchContainer = ({ children, className, style }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create or reset canvas
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      containerRef.current.appendChild(canvasRef.current);
    }
    
    const container = containerRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas size and position
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '-1';
    
    // Draw sketchy rectangle
    const rc = rough.canvas(canvas);
    rc.rectangle(0, 0, container.offsetWidth, container.offsetHeight, {
      fill: 'white',
      fillStyle: 'solid',
      roughness: 1.5,
      stroke: '#435058',
      strokeWidth: 2,
      bowing: 2
    });
    
    // Handle resize
    const handleResize = () => {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
      rc.rectangle(0, 0, container.offsetWidth, container.offsetHeight, {
        fill: 'white',
        fillStyle: 'solid',
        roughness: 1.5,
        stroke: '#435058',
        strokeWidth: 2,
        bowing: 2
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      className={`sketch-container ${className || ''}`}
      style={{ position: 'relative', ...style }}
    >
      {children}
    </div>
  );
};

export default SketchContainer;