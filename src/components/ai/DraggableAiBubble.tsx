import React, { useState, useEffect, useRef } from 'react';

interface DraggableAiBubbleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const DraggableAiBubble: React.FC<DraggableAiBubbleProps> = ({
  isOpen,
  onToggle,
}) => {
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window === 'undefined') return { x: 300, y: 500 };
    const saved = localStorage.getItem('thanhlong_ai_bubble_pos');
    if (saved) {
      try {
        const pos = JSON.parse(saved);
        if (typeof pos.x === 'number' && typeof pos.y === 'number') {
          const safeX = Math.min(Math.max(12, pos.x), window.innerWidth - 76);
          const safeY = Math.min(Math.max(12, pos.y), window.innerHeight - 76);
          return { x: safeX, y: safeY };
        }
      } catch {}
    }
    return {
      x: Math.max(12, window.innerWidth - 76),
      y: Math.max(12, window.innerHeight - (window.innerWidth < 1024 ? 140 : 92)),
    };
  });

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initX: number;
    initY: number;
  }>({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
  });
  const hasMovedRef = useRef<boolean>(false);

  // Keep bubble inside viewport on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        const safeX = Math.min(Math.max(12, prev.x), window.innerWidth - 76);
        const safeY = Math.min(Math.max(12, prev.y), window.innerHeight - 76);
        return { x: safeX, y: safeY };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: position.x,
      initY: position.y,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasMovedRef.current = true;
    }

    const nextX = Math.min(
      Math.max(12, dragStartRef.current.initX + dx),
      window.innerWidth - 76
    );
    const nextY = Math.min(
      Math.max(12, dragStartRef.current.initY + dy),
      window.innerHeight - 76
    );

    setPosition({ x: nextX, y: nextY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    // Persist position
    localStorage.setItem('thanhlong_ai_bubble_pos', JSON.stringify(position));

    // If pointer didn't move significantly, consider it a click to toggle chat
    if (!hasMovedRef.current) {
      onToggle();
    }
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      className={`fixed z-40 select-none touch-none cursor-grab active:cursor-grabbing group transition-shadow duration-200 ${
        isDragging ? 'scale-105' : 'hover:scale-105 active:scale-95'
      }`}
      title="Bong bóng Trợ lý AI (Kéo để di chuyển vị trí • Bấm để chat)"
    >
      {/* Draggable Bubble Body */}
      <div className="relative w-14 h-14 rounded-full bg-slate-900/95 backdrop-blur-md border-2 border-amber-400 shadow-[0_10px_25px_rgba(245,158,11,0.35)] hover:shadow-[0_12px_30px_rgba(245,158,11,0.5)] flex flex-col items-center justify-center transition-all">
        {/* Breathing Status Indicator */}
        <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900 absolute -top-1 -right-1 animate-pulse shadow-sm" />

        {/* AI Brand Text */}
        <span className="text-amber-300 font-extrabold text-sm tracking-wider font-sans leading-none">
          AI
        </span>
        <span className="text-[8px] font-bold text-slate-400 tracking-tight leading-none mt-0.5">
          {isOpen ? 'MỞ' : 'CHAT'}
        </span>
      </div>

      {/* Hover Drag Hint (Desktop) */}
      <div className="hidden lg:group-hover:block absolute left-1/2 -translate-x-1/2 -top-8 px-2.5 py-1 rounded-md bg-slate-900/95 border border-slate-800 text-[10px] font-medium text-slate-300 whitespace-nowrap shadow-xl pointer-events-none">
        Kéo để di chuyển • Nhấp để mở
      </div>
    </div>
  );
};
