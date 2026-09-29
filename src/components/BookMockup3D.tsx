import React, { useState, useRef, useEffect } from 'react';
import { Book } from '../types/book';
import { THEME_PALETTES } from '../data/themes';
import { RotateCcw, Play, Pause, Camera, Eye, Sparkles, X, BookOpen, Download } from 'lucide-react';

interface BookMockup3DProps {
  book: Book;
  onClose: () => void;
  onOpenReader?: () => void;
  onOpenExport?: () => void;
}

export const BookMockup3D: React.FC<BookMockup3DProps> = ({
  book,
  onClose,
  onOpenReader,
  onOpenExport,
}) => {
  const theme = THEME_PALETTES[book.themeId] || THEME_PALETTES['deep-indigo'];
  
  // 3D rotation state
  const [rotX, setRotX] = useState<number>(15);
  const [rotY, setRotY] = useState<number>(-25);
  const [isHardcover, setIsHardcover] = useState<boolean>(true);
  const [hasFoil, setHasFoil] = useState<boolean>(true);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  
  const dragStartRef = useRef<{ x: number; y: number; rotX: number; rotY: number }>({
    x: 0,
    y: 0,
    rotX: 15,
    rotY: -25,
  });

  const animFrameRef = useRef<number | null>(null);
  const mockupContainerRef = useRef<HTMLDivElement>(null);

  // Auto-rotation effect
  useEffect(() => {
    if (!isAutoRotating || isDragging) return;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      setRotY((prev) => (prev + delta * 18) % 360);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isAutoRotating, isDragging]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setIsAutoRotating(false);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotX,
      rotY,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    
    // Invert dy for natural tilt
    const newRotX = Math.max(-60, Math.min(60, dragStartRef.current.rotX - dy * 0.4));
    const newRotY = dragStartRef.current.rotY + dx * 0.5;
    
    setRotX(newRotX);
    setRotY(newRotY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    setIsAutoRotating(false);
    dragStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      rotX,
      rotY,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    
    const newRotX = Math.max(-60, Math.min(60, dragStartRef.current.rotX - dy * 0.4));
    const newRotY = dragStartRef.current.rotY + dx * 0.5;
    
    setRotX(newRotX);
    setRotY(newRotY);
  };

  const setPreset = (x: number, y: number) => {
    setIsAutoRotating(false);
    setRotX(x);
    setRotY(y);
  };

  const bookThickness = isHardcover ? 42 : 24; // mm in 3D space (pixels)
  const bookWidth = 240;
  const bookHeight = 340;

  // Snapshot capture via canvas
  const captureMockupSnapshot = () => {
    setIsCapturing(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 900;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Studio background gradient
      const bgGrad = ctx.createRadialGradient(600, 450, 50, 600, 450, 700);
      bgGrad.addColorStop(0, '#27272a');
      bgGrad.addColorStop(1, '#09090b');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 900);

      // Studio tabletop floor
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.fillRect(0, 500, 1200, 400);

      // Book drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(600, 680, 260, 45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw book cover rectangle
      ctx.save();
      ctx.translate(600, 450);
      ctx.rotate((-rotY * Math.PI) / 360);

      ctx.fillStyle = theme.primary;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 35;
      ctx.fillRect(-170, -240, 340, 480);
      ctx.shadowBlur = 0;

      // Gold / Accent border
      ctx.strokeStyle = hasFoil ? theme.accent : 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 4;
      ctx.strokeRect(-155, -225, 310, 450);
      ctx.lineWidth = 1;
      ctx.strokeRect(-150, -220, 300, 440);

      // Title & Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px Cormorant Garamond, serif';
      ctx.textAlign = 'center';
      
      const words = book.title.split(' ');
      let line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ');
      let line2 = words.slice(Math.ceil(words.length / 2)).join(' ');
      
      ctx.fillText(line1, 0, -60);
      if (line2) ctx.fillText(line2, 0, -25);

      // Accent rule
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-50, 10);
      ctx.lineTo(50, 10);
      ctx.stroke();

      // Subtitle
      ctx.fillStyle = '#e4e4e7';
      ctx.font = 'italic 16px Cormorant Garamond, serif';
      const subWords = book.subtitle.split(' ');
      ctx.fillText(subWords.slice(0, 6).join(' '), 0, 40);

      // Author
      ctx.fillStyle = theme.accent;
      ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
      ctx.fillText('AUTHORED BY', 0, 160);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Cormorant Garamond, serif';
      ctx.fillText(book.author, 0, 185);

      ctx.restore();

      // Export canvas
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${book.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_3D_Mockup.png`;
      a.click();
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsCapturing(false), 400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex flex-col items-center justify-between text-stone-100 overflow-hidden select-none">
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-900/60 z-20">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tracking-tight text-stone-200">
            3D Studio Mockup
          </span>
          <span className="text-stone-500 text-xs">·</span>
          <span className="text-xs text-stone-400 font-serif italic truncate max-w-xs md:max-w-md">
            {book.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenReader && (
            <button
              onClick={onOpenReader}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-md transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Read</span>
            </button>
          )}
          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-md transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          )}
          <button
            onClick={captureMockupSnapshot}
            disabled={isCapturing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-stone-100 hover:bg-white text-stone-950 rounded-md transition-colors shadow-sm"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{isCapturing ? 'Saving...' : 'Save PNG'}</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-md transition-colors ml-1"
            title="Close 3D View"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Viewport */}
      <div
        ref={mockupContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        className="w-full flex-1 flex items-center justify-center relative cursor-grab active:cursor-grabbing overflow-hidden"
        style={{ perspective: '1400px' }}
      >
        {/* Soft Background Studio Spotlight */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 transition-all duration-700"
          style={{
            background: `radial-gradient(circle at 50% 45%, ${theme.primary}55 0%, transparent 65%)`,
          }}
        />

        {/* Ambient Floor Grid / Reflection Plane */}
        <div
          className="absolute bottom-10 w-[700px] h-[300px] rounded-full pointer-events-none opacity-50 blur-2xl"
          style={{
            background: `radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, transparent 75%)`,
            transform: `translateY(120px) scale(${1 + rotX * 0.005})`,
          }}
        />

        {/* 3D BOOK OBJECT WRAPPER */}
        <div
          className="relative transition-transform duration-75"
          style={{
            width: `${bookWidth}px`,
            height: `${bookHeight}px`,
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          }}
        >
          {/* 1. FRONT COVER */}
          <div
            className="absolute inset-0 rounded-r-md shadow-2xl p-6 flex flex-col justify-between overflow-hidden"
            style={{
              transform: `translateZ(${bookThickness / 2}px)`,
              backgroundColor: theme.primary,
              border: `1px solid ${hasFoil ? theme.accent : 'rgba(255,255,255,0.15)'}`,
              backfaceVisibility: 'hidden',
              boxShadow: 'inset 4px 0 12px rgba(0,0,0,0.5), 0 25px 50px -12px rgba(0,0,0,0.7)',
            }}
          >
            {/* Subtle Texture & Sheen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-white/10 pointer-events-none" />

            {/* Architectural Border Frame */}
            <div
              className="absolute inset-3 border pointer-events-none"
              style={{
                borderColor: hasFoil ? theme.accent : 'rgba(255,255,255,0.25)',
                opacity: 0.85,
              }}
            >
              <div
                className="absolute inset-1 border pointer-events-none opacity-50"
                style={{ borderColor: hasFoil ? theme.accent : 'rgba(255,255,255,0.15)' }}
              />
            </div>

            {/* Front Header */}
            <div className="relative z-10 text-center pt-2">
              <span
                className="text-[9px] tracking-[0.25em] uppercase font-sans font-semibold"
                style={{ color: hasFoil ? theme.accent : '#d4d4d8' }}
              >
                FolioCraft Monograph
              </span>
              <div className="text-[8px] text-stone-300 tracking-wider uppercase mt-0.5">
                {book.genre} · {book.publicationYear}
              </div>
            </div>

            {/* Front Title & Subtitle */}
            <div className="relative z-10 text-center px-2 py-4">
              <div
                className="w-8 h-0.5 mx-auto mb-3"
                style={{ backgroundColor: hasFoil ? theme.accent : '#e4e4e7' }}
              />
              <h2 className="font-serif text-2xl font-bold text-white tracking-tight leading-tight line-clamp-3">
                {book.title}
              </h2>
              <p className="font-serif italic text-stone-300 text-xs mt-2 line-clamp-2 leading-relaxed">
                {book.subtitle}
              </p>
            </div>

            {/* Front Author & Foil Stamp */}
            <div className="relative z-10 text-center pb-2">
              <div
                className="text-[8px] font-sans font-medium uppercase tracking-widest"
                style={{ color: hasFoil ? theme.accent : '#a1a1aa' }}
              >
                Authored by
              </div>
              <div className="font-serif font-bold text-sm text-stone-100 mt-0.5">
                {book.author}
              </div>
              <div className="text-[8px] text-stone-400 mt-1 font-mono">
                {book.edition}
              </div>
            </div>
          </div>

          {/* 2. BACK COVER */}
          <div
            className="absolute inset-0 rounded-l-md p-6 flex flex-col justify-between text-stone-300"
            style={{
              transform: `rotateY(180deg) translateZ(${bookThickness / 2}px)`,
              backgroundColor: theme.primary,
              border: `1px solid ${hasFoil ? theme.accent : 'rgba(255,255,255,0.1)'}`,
              backfaceVisibility: 'hidden',
              boxShadow: 'inset -4px 0 12px rgba(0,0,0,0.5)',
            }}
          >
            <div className="border-b border-stone-700/80 pb-3">
              <span className="text-[9px] tracking-widest uppercase font-semibold text-stone-400">
                Critical Praise & Overview
              </span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed font-serif">
              <p className="text-stone-300 line-clamp-4 italic">
                “{book.chapters[0]?.summary || book.subtitle}”
              </p>
              <div className="text-[10px] text-stone-400 font-sans">
                Targeted Audience: <span className="text-stone-200">{book.demographic.targetAudience}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-700/80 flex items-center justify-between">
              <div className="text-[9px] font-mono text-stone-400">
                ISBN 978-0-241-92{book.publicationYear}
              </div>
              <div className="w-12 h-6 bg-white/90 rounded px-1 flex items-center justify-center">
                <div className="flex gap-0.5 items-end h-4">
                  <div className="w-0.5 h-4 bg-black" />
                  <div className="w-0.5 h-3 bg-black" />
                  <div className="w-1 h-4 bg-black" />
                  <div className="w-0.5 h-2 bg-black" />
                  <div className="w-0.5 h-4 bg-black" />
                </div>
              </div>
            </div>
          </div>

          {/* 3. BOOK SPINE (Left Side) */}
          <div
            className="absolute top-0 bottom-0 flex flex-col items-center justify-between py-5 overflow-hidden"
            style={{
              width: `${bookThickness}px`,
              left: 0,
              transformOrigin: 'left',
              transform: `rotateY(-90deg) translateZ(0px)`,
              backgroundColor: theme.secondary || theme.primary,
              borderTop: `1px solid rgba(255,255,255,0.1)`,
              borderBottom: `1px solid rgba(255,255,255,0.1)`,
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.6)',
            }}
          >
            {/* Top Spine Ornament */}
            <div
              className="w-2.5 h-2.5 border rotate-45"
              style={{ borderColor: hasFoil ? theme.accent : 'rgba(255,255,255,0.4)' }}
            />

            {/* Vertical Title along Spine */}
            <div
              className="text-white font-serif font-bold text-[11px] whitespace-nowrap tracking-wide select-none"
              style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
              }}
            >
              {book.title}
            </div>

            {/* Bottom Spine Author */}
            <div
              className="text-[9px] font-sans font-medium uppercase tracking-wider text-stone-300 select-none"
              style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
              }}
            >
              {book.author.split(' ')[0]}
            </div>
          </div>

          {/* 4. PAGE BLOCK EDGES (Right Side - Paper Edge) */}
          <div
            className="absolute top-1 bottom-1 flex items-center justify-center overflow-hidden"
            style={{
              width: `${bookThickness - 4}px`,
              right: 0,
              transformOrigin: 'right',
              transform: `rotateY(90deg) translateZ(-2px)`,
              backgroundColor: '#f5f0e6', // Archival cream paper edge
              boxShadow: 'inset 0 0 8px rgba(0,0,0,0.3)',
              backgroundImage: 'repeating-linear-gradient(0deg, #f5f0e6, #f5f0e6 1px, #e6ded0 1px, #e6ded0 2px)',
            }}
          />

          {/* 5. TOP PAGE EDGE */}
          <div
            className="absolute left-1 right-1"
            style={{
              height: `${bookThickness - 4}px`,
              top: 0,
              transformOrigin: 'top',
              transform: `rotateX(90deg) translateZ(2px)`,
              backgroundColor: '#eae3d5',
              backgroundImage: 'repeating-linear-gradient(90deg, #eae3d5, #eae3d5 1px, #ded4c3 1px, #ded4c3 2px)',
              boxShadow: 'inset 0 0 8px rgba(0,0,0,0.35)',
            }}
          />

          {/* 6. BOTTOM PAGE EDGE */}
          <div
            className="absolute left-1 right-1"
            style={{
              height: `${bookThickness - 4}px`,
              bottom: 0,
              transformOrigin: 'bottom',
              transform: `rotateX(-90deg) translateZ(2px)`,
              backgroundColor: '#ded4c3',
              backgroundImage: 'repeating-linear-gradient(90deg, #ded4c3, #ded4c3 1px, #cfc3af 1px, #cfc3af 2px)',
            }}
          />
        </div>
      </div>

      {/* Floating Bottom Control Bar */}
      <div className="w-full max-w-2xl px-6 py-4 z-20 flex flex-wrap items-center justify-between gap-3 border-t border-stone-800 bg-stone-900/80 rounded-t-xl backdrop-blur-md">
        {/* Preset Angles */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-stone-400 mr-1.5 uppercase font-medium">Angles:</span>
          <button
            onClick={() => setPreset(15, -25)}
            className="px-2.5 py-1 text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-200 rounded transition-colors"
          >
            3/4 Front
          </button>
          <button
            onClick={() => setPreset(5, -75)}
            className="px-2.5 py-1 text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-200 rounded transition-colors"
          >
            Spine
          </button>
          <button
            onClick={() => setPreset(0, 0)}
            className="px-2.5 py-1 text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-200 rounded transition-colors"
          >
            Flat Front
          </button>
          <button
            onClick={() => setPreset(45, -35)}
            className="px-2.5 py-1 text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-200 rounded transition-colors"
          >
            Top Down
          </button>
        </div>

        {/* Toggles: Hardcover, Foil, Auto-Rotate */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsHardcover(!isHardcover)}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              isHardcover ? 'bg-stone-700 text-white' : 'bg-stone-800 text-stone-400'
            }`}
          >
            {isHardcover ? 'Hardcover (42mm)' : 'Softcover (24mm)'}
          </button>

          <button
            onClick={() => setHasFoil(!hasFoil)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              hasFoil ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60' : 'bg-stone-800 text-stone-400'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Foil Finish</span>
          </button>

          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              isAutoRotating ? 'bg-indigo-950 text-indigo-200 border border-indigo-800/60' : 'bg-stone-800 text-stone-400'
            }`}
          >
            {isAutoRotating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isAutoRotating ? 'Pause' : 'Rotate'}</span>
          </button>

          <button
            onClick={() => {
              setRotX(15);
              setRotY(-25);
            }}
            className="p-1.5 text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 rounded transition-colors"
            title="Reset Angle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
