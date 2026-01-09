
import React, { useEffect, useRef } from 'react';

interface FireworksProps {
  onComplete: () => void;
}

const Fireworks: React.FC<FireworksProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let fireworks: Firework[] = [];
    let animationFrameId: number;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
      x: number; y: number;
      vx: number; vy: number;
      alpha: number; color: string;
      gravity: number; friction: number;

      constructor(x: number, y: number, color: string) {
        this.x = x; this.y = y;
        this.color = color;
        this.alpha = 1;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.gravity = 0.06;
        this.friction = 0.96;
      }

      update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= 0.008;
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    class Firework {
      x: number; y: number;
      targetY: number; color: string;
      speed: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = canvas!.height;
        this.targetY = Math.random() * (canvas!.height * 0.4) + 50;
        this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
        this.speed = 5;
      }

      update() {
        this.y -= this.speed;
        if (this.y <= this.targetY) {
          for (let i = 0; i < 60; i++) {
            particles.push(new Particle(this.x, this.y, this.color));
          }
          return true;
        }
        return false;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const animate = () => {
      // Хитрость для шлейфов на прозрачном фоне:
      // Мы не заливаем всё черным, а постепенно "вытираем" старые кадры
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Возвращаем режим обычного рисования поверх
      ctx.globalCompositeOperation = 'source-over';

      if (Math.random() < 0.06) {
        fireworks.push(new Firework());
      }

      fireworks = fireworks.filter(f => {
        const exploded = f.update();
        if (!exploded) f.draw();
        return !exploded;
      });

      particles = particles.filter(p => {
        p.update();
        p.draw();
        return p.alpha > 0;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const timer = setTimeout(() => {
      onComplete();
    }, 15000); // Салют длится 15 секунд

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[200] pointer-events-none"
      style={{ background: 'transparent' }}
    />
  );
};

export default Fireworks;
