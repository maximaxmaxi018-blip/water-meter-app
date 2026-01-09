
import React, { useState, useEffect, useMemo } from 'react';

export interface TutorialStep {
  targetId: string;
  title: string;
  content: string;
  view?: string; 
}

interface TutorialOverlayProps {
  steps: TutorialStep[];
  onComplete: () => void;
  currentView: string;
}

type Position = 'top' | 'bottom' | 'left' | 'right' | 'center';

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ steps, onComplete, currentView }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const currentStep = steps[currentStepIdx];

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const updateRect = () => {
      const el = document.getElementById(currentStep.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
        
        // Скроллим к элементу, если это не центрированная подсказка
        if (currentStepIdx !== 2) {
          const isOutside = rect.top < 100 || rect.bottom > window.innerHeight - 100;
          if (isOutside) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    const interval = setInterval(updateRect, 200);
    window.addEventListener('scroll', updateRect);
    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', updateRect);
    };
  }, [currentStep, currentStepIdx, currentView, windowSize]);

  const handleNext = () => {
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
    }
  };

  const popoverStyles = useMemo(() => {
    const tooltipWidth = Math.min(windowSize.width - 48, 300); // Еще компактнее
    const padding = 24;

    // СПЕЦИАЛЬНЫЙ СЛУЧАЙ: Третий шаг (индекс 2) — по центру экрана
    if (currentStepIdx === 2) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        position: 'center' as Position,
        width: tooltipWidth,
        maxHeight: windowSize.height - 100
      };
    }

    if (!targetRect) return null;

    const spaceBelow = windowSize.height - targetRect.bottom;
    const spaceAbove = targetRect.top;
    const spaceLeft = targetRect.left;
    const spaceRight = windowSize.width - targetRect.right;

    let position: Position = 'bottom';
    let top: number | string = 'auto';
    let bottom: number | string = 'auto';
    let left: number | string = 'auto';
    let right: number | string = 'auto';

    // Первый шаг — сбоку
    const isFirstStep = currentStepIdx === 0;
    if (isFirstStep && windowSize.width > 768) {
      if (spaceRight > tooltipWidth + 40) {
        position = 'right';
        left = targetRect.right + 16;
        top = targetRect.top + (targetRect.height / 2) - 80;
      } else if (spaceLeft > tooltipWidth + 40) {
        position = 'left';
        left = targetRect.left - tooltipWidth - 16;
        top = targetRect.top + (targetRect.height / 2) - 80;
      } else {
        position = spaceBelow >= spaceAbove ? 'bottom' : 'top';
      }
    } else {
      position = spaceBelow >= spaceAbove || spaceBelow > 200 ? 'bottom' : 'top';
    }

    if (position === 'top' || position === 'bottom') {
      left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
      left = Math.max(padding, Math.min(left as number, windowSize.width - tooltipWidth - padding));
      if (position === 'bottom') top = targetRect.bottom + 14;
      else bottom = (windowSize.height - targetRect.top) + 14;
    }

    const maxHeight = position === 'bottom' 
      ? (windowSize.height - (top as number) - 40) 
      : position === 'top' 
        ? (windowSize.height - (bottom as number) - 40)
        : (windowSize.height - 80);

    return { top, bottom, left, right, width: tooltipWidth, position, maxHeight, transform: 'none' };
  }, [targetRect, windowSize, currentStepIdx]);

  if (currentStep.view && currentStep.view !== currentView) return null;

  return (
    <div className="fixed inset-0 z-[999] pointer-events-none overflow-hidden select-none">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px] transition-all duration-500 ease-in-out"
        style={{
          clipPath: targetRect 
            ? `polygon(0% 0%, 0% 100%, ${targetRect.left - 8}px 100%, ${targetRect.left - 8}px ${targetRect.top - 8}px, ${targetRect.right + 8}px ${targetRect.top - 8}px, ${targetRect.right + 8}px ${targetRect.bottom + 8}px, ${targetRect.left - 8}px ${targetRect.bottom + 8}px, ${targetRect.left - 8}px 100%, 100% 100%, 100% 0%)`
            : 'none'
        }}
      />

      {targetRect && (
        <div 
          className="absolute border-2 border-primary-500/60 rounded-2xl shadow-[0_0_30px_rgba(14,165,233,0.2)] transition-all duration-500 ease-in-out pointer-events-none"
          style={{
            top: targetRect.top - 10,
            left: targetRect.left - 10,
            width: targetRect.width + 20,
            height: targetRect.height + 20,
          }}
        />
      )}

      {popoverStyles && (
        <div 
          className="absolute pointer-events-auto bg-white dark:bg-gray-900 rounded-[1.8rem] p-4 md:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] border border-primary-100/50 dark:border-primary-800/50 transition-all duration-500 animate-in fade-in zoom-in-95 ease-out flex flex-col"
          style={{
            top: popoverStyles.top,
            bottom: popoverStyles.bottom,
            left: popoverStyles.left,
            right: popoverStyles.right,
            width: popoverStyles.width,
            maxHeight: Math.max(150, popoverStyles.maxHeight || 400),
            transform: popoverStyles.transform
          }}
        >
          <div className="flex justify-between items-center mb-2 shrink-0">
            <div className="flex items-center gap-2">
               <div className="w-5 h-5 bg-primary-600 rounded-lg flex items-center justify-center text-white text-[9px] font-black shadow-md">
                 {currentStepIdx + 1}
               </div>
               <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Шаг {currentStepIdx + 1} из {steps.length}</span>
            </div>
            <button onClick={onComplete} className="text-gray-400 hover:text-red-500 transition-all p-1">
              <i className="fas fa-times text-xs"></i>
            </button>
          </div>
          
          <div className="overflow-y-auto custom-scrollbar pr-1 mb-3 min-h-0">
            <h4 className="text-base font-black text-gray-900 dark:text-white mb-1 tracking-tight leading-tight">{currentStep.title}</h4>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-snug font-medium">{currentStep.content}</p>
          </div>
          
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <button 
              onClick={onComplete}
              className="text-[8px] font-black uppercase tracking-widest text-gray-400 hover:text-primary-600 transition-colors"
            >
              Пропустить
            </button>
            <div className="flex gap-1.5">
              {currentStepIdx > 0 && (
                <button 
                  onClick={handleBack}
                  className="px-2.5 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
                >
                  Назад
                </button>
              )}
              <button 
                onClick={handleNext}
                className="px-3.5 py-1 bg-primary-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/10 hover:bg-primary-500 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>{currentStepIdx === steps.length - 1 ? 'Готово' : 'Далее'}</span>
                <i className={`fas ${currentStepIdx === steps.length - 1 ? 'fa-check' : 'fa-arrow-right'} text-[7px]`}></i>
              </button>
            </div>
          </div>

          {popoverStyles.position !== 'center' && targetRect && (
            <div 
              className={`absolute w-3 h-3 bg-white dark:bg-gray-900 rotate-45 border-primary-100 dark:border-primary-800 shadow-sm transition-all duration-500
                ${popoverStyles.position === 'bottom' ? '-top-1.5 border-l border-t' : ''}
                ${popoverStyles.position === 'top' ? '-bottom-1.5 border-r border-b' : ''}
                ${popoverStyles.position === 'right' ? '-left-1.5 border-l border-b' : ''}
                ${popoverStyles.position === 'left' ? '-right-1.5 border-r border-t' : ''}
              `}
              style={{ 
                left: (popoverStyles.position === 'top' || popoverStyles.position === 'bottom') 
                  ? Math.max(12, Math.min(popoverStyles.width - 24, targetRect.left + targetRect.width / 2 - (popoverStyles.left as number) - 6))
                  : 'auto',
                top: (popoverStyles.position === 'left' || popoverStyles.position === 'right')
                  ? Math.max(12, Math.min(150, targetRect.top + targetRect.height / 2 - (popoverStyles.top as number) - 6))
                  : 'auto'
              }}
            />
          )}
        </div>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
      `}</style>
    </div>
  );
};

export default TutorialOverlay;
