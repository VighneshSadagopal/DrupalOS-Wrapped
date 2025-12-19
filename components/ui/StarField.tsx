import React, { useEffect, useRef } from 'react';

const StarField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const stars: { x: number; y: number; z: number; pz: number }[] = [];
    const numStars = 400;
    const speed = 4;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width - width / 2,
        y: Math.random() * height - height / 2,
        z: Math.random() * width,
        pz: 0
      });
      stars[i].pz = stars[i].z;
    }

    let animationId: number;

    const animate = () => {
      // Dark space background with slight trail effect
      ctx.fillStyle = "rgba(5, 5, 10, 0.3)";
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      for (let i = 0; i < numStars; i++) {
        const star = stars[i];

        // Move star closer
        star.z -= speed;

        // Reset if passed camera
        if (star.z <= 0) {
          star.x = Math.random() * width - width / 2;
          star.y = Math.random() * height - height / 2;
          star.z = width;
          star.pz = width;
        }

        // Project 3D coordinates to 2D
        const x = cx + (star.x / star.z) * width;
        const y = cy + (star.y / star.z) * height;

        // Previous position for trails
        const px = cx + (star.x / star.pz) * width;
        const py = cy + (star.y / star.pz) * height;

        star.pz = star.z;

        if (x < 0 || x > width || y < 0 || y > height) continue;

        // Calculate size based on proximity
        const s = (1 - star.z / width) * 3;

        // Draw Star Trail
        ctx.beginPath();
        ctx.strokeStyle = `rgba(14, 165, 233, ${1 - star.z / width})`; // Cyan glow
        ctx.lineWidth = s;
        ctx.moveTo(px, py);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full z-0 pointer-events-none bg-black" 
    />
  );
};

export default StarField;