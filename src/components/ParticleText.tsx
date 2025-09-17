'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ParticleTextProps {
  text: string;
  className?: string;
}

class Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  pointsRef: React.MutableRefObject<Point[]>;
  maskRef: React.MutableRefObject<ImageData | null>;

  constructor(
    x: number,
    y: number,
    vx: number = 1,
    vy: number = 1,
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    pointsRef: React.MutableRefObject<Point[]>,
    maskRef: React.MutableRefObject<ImageData | null>
  ) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.ctx = ctx;
    this.canvas = canvas;
    this.pointsRef = pointsRef;
    this.maskRef = maskRef;
  }

  update() {
    this.ctx.beginPath();
    this.ctx.fillStyle = '#95a5a6';
    this.ctx.arc(this.x, this.y, 1, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.closePath();

    // Change direction if running into black pixel
    if (
      this.x + this.vx >= this.canvas.width ||
      this.x + this.vx < 0 ||
      (this.maskRef.current && this.maskRef.current.data[this.coordsToI(this.x + this.vx, this.y, this.maskRef.current.width)] != 255)
    ) {
      this.vx *= -1;
      this.x += this.vx * 2;
    }
    if (
      this.y + this.vy >= this.canvas.height ||
      this.y + this.vy < 0 ||
      (this.maskRef.current && this.maskRef.current.data[this.coordsToI(this.x, this.y + this.vy, this.maskRef.current.width)] != 255)
    ) {
      this.vy *= -1;
      this.y += this.vy * 2;
    }

    // Draw connections between nearby points
    for (let k = 0; k < this.pointsRef.current.length; k++) {
      if (this.pointsRef.current[k] === this) continue;

      const dx = this.x - this.pointsRef.current[k].x;
      const dy = this.y - this.pointsRef.current[k].y;
      const d = Math.sqrt(dx * dx + dy * dy);

      if (d > 30) continue; // Increased connection distance for larger canvas

      if (d < 8) {
        this.ctx.strokeStyle = '#95a5a6';
        this.ctx.lineWidth = 0.3;
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
        this.ctx.lineTo(this.pointsRef.current[k].x, this.pointsRef.current[k].y);
        this.ctx.stroke();
      } else if (d < 30) {
        this.ctx.strokeStyle = '#95a5a6';
        this.ctx.lineWidth = 0.15;
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
        this.ctx.lineTo(this.pointsRef.current[k].x, this.pointsRef.current[k].y);
        this.ctx.stroke();
      }
    }

    this.x += this.vx;
    this.y += this.vy;
  }

  private coordsToI(x: number, y: number, w: number) {
    if (!this.maskRef.current) return 0;
    return (this.maskRef.current.width * y + x) * 4;
  }
}

export default function ParticleText({ text, className = '' }: ParticleTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const pointsRef = useRef<Point[]>([]);
  const whitePixelsRef = useRef<number[][]>([]);
  const maskRef = useRef<ImageData | null>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 300, fontSize: 120 });

  // Function to calculate full-screen dimensions
  const calculateDimensions = () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Calculate font size to span most of the screen width
    let fontSize = Math.min(screenWidth * 0.15, screenHeight * 0.2); // 15% of screen width or 20% of height

    // Ensure minimum and maximum font sizes
    fontSize = Math.max(fontSize, 80); // Minimum 80px
    fontSize = Math.min(fontSize, 200); // Maximum 200px

    // Canvas dimensions - full screen width, proportional height
    const canvasWidth = screenWidth;
    const canvasHeight = Math.min(fontSize * 2, screenHeight * 0.4); // Height based on font size, max 40% of screen

    return {
      width: canvasWidth,
      height: canvasHeight,
      fontSize
    };
  };

  useEffect(() => {
    const handleResize = () => {
      const newDimensions = calculateDimensions();
      setDimensions(newDimensions);
    };

    // Set initial dimensions after component mounts
    const timer = setTimeout(() => {
      handleResize();
    }, 100);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height, fontSize } = dimensions;
    // Increase particle count for larger canvas
    const pointCount = Math.min(Math.floor((width * height) / 1500), 800);
    const fontStr = `bold ${fontSize}px Helvetica Neue, Helvetica, Arial, sans-serif`;

    function loop() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let k = 0; k < pointsRef.current.length; k++) {
        pointsRef.current[k].update();
      }
      animationRef.current = requestAnimationFrame(loop);
    }

    function init() {
      if (!ctx || !canvas) return;
      // Set canvas to full screen dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw text
      ctx.beginPath();
      ctx.fillStyle = '#000';
      ctx.rect(0, 0, canvas.width, canvas.height);
      ctx.fill();
      ctx.font = fontStr;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      // Center the text both horizontally and vertically
      ctx.fillText(text, canvas.width / 2, canvas.height / 2 + fontSize / 3);
      ctx.closePath();

      // Save mask
      maskRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Draw background
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Save all white pixels in an array
      whitePixelsRef.current = [];
      for (let i = 0; i < maskRef.current.data.length; i += 4) {
        if (
          maskRef.current.data[i] == 255 &&
          maskRef.current.data[i + 1] == 255 &&
          maskRef.current.data[i + 2] == 255 &&
          maskRef.current.data[i + 3] == 255
        ) {
          whitePixelsRef.current.push([iToX(i, maskRef.current.width), iToY(i, maskRef.current.width)]);
        }
      }

      // Create points
      pointsRef.current = [];
      for (let k = 0; k < pointCount; k++) {
        addPoint();
      }

      // Start animation
      loop();
    }

    function addPoint() {
      if (!ctx || !canvas || whitePixelsRef.current.length === 0) return;

      const spawn = whitePixelsRef.current[Math.floor(Math.random() * whitePixelsRef.current.length)];
      const p = new Point(
        spawn[0],
        spawn[1],
        Math.floor(Math.random() * 2 - 1) || 1,
        Math.floor(Math.random() * 2 - 1) || 1,
        ctx,
        canvas,
        pointsRef,
        maskRef
      );
      pointsRef.current.push(p);
    }

    function iToX(i: number, w: number) {
      return (i % (4 * w)) / 4;
    }

    function iToY(i: number, w: number) {
      return Math.floor(i / (4 * w));
    }

    init();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      pointsRef.current = [];
    };
  }, [text, dimensions]);

  return (
    <div ref={containerRef} className={`fixed inset-0 ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          width: '100vw',
          height: dimensions.height,
        }}
      />
    </div>
  );
}