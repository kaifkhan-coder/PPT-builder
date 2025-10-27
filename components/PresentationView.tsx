import React, { useState, useCallback, useEffect } from 'react';
import type { PresentationData } from '../types';
import Slide from './Slide';
import { ArrowLeftIcon, ArrowRightIcon } from './Icons';

interface PresentationViewProps {
  presentation: PresentationData;
  onReset: () => void;
}

const PresentationView: React.FC<PresentationViewProps> = ({ presentation, onReset }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const goToNext = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev + 1) % presentation.length);
  }, [presentation.length]);

  const goToPrev = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev - 1 + presentation.length) % presentation.length);
  }, [presentation.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        goToNext();
      } else if (event.key === 'ArrowLeft') {
        goToPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToNext, goToPrev]);

  return (
    <div className="w-full h-full flex flex-col bg-slate-800 rounded-lg shadow-2xl overflow-hidden relative">
      <div className="flex-grow relative">
        <Slide
          key={currentSlideIndex}
          slide={presentation[currentSlideIndex]}
          isActive={true}
          watermarkText="made with kaif"
        />
      </div>
      
      {/* Navigation Controls */}
      <button 
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors z-10"
        aria-label="Previous Slide"
      >
        <ArrowLeftIcon className="w-6 h-6" />
      </button>
      <button 
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors z-10"
        aria-label="Next Slide"
      >
        <ArrowRightIcon className="w-6 h-6" />
      </button>
      
      {/* Footer with slide count and reset */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/20 backdrop-blur-sm flex justify-between items-center text-sm">
        <button onClick={onReset} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md transition-colors">
          Start Over
        </button>
        <span className="font-mono">{currentSlideIndex + 1} / {presentation.length}</span>
      </div>
    </div>
  );
};

export default PresentationView;