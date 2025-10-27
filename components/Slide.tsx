import React from 'react';
import type { SlideData } from '../types';

interface SlideProps {
  slide: SlideData;
  isActive: boolean;
  watermarkText: string;
}

const Slide: React.FC<SlideProps> = ({ slide, watermarkText }) => {
  const layout = slide.layout || 'full';
  
  return (
    <div
      className={`absolute inset-0 w-full h-full p-8 md:p-12 lg:p-16 flex flex-col justify-center items-center text-center`}
    >
      {slide.imageUrl && (
        <div className="absolute inset-0 w-full h-full -z-10">
            <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-slate-900/70"></div>
        </div>
      )}

      {layout !== 'content_only' && slide.title && (
        <h2 className="text-3xl md:text-5xl font-bold text-cyan-300 drop-shadow-lg mb-6 animate-fade-in-down">
          {slide.title}
        </h2>
      )}
      {layout !== 'title_only' && slide.content && slide.content.length > 0 && (
        <ul className="space-y-4 text-lg md:text-2xl text-slate-200 text-left list-disc list-inside max-w-4xl">
          {slide.content.map((item, index) => (
            <li 
              key={index} 
              className="animate-fade-in-up" 
              style={{ animationDelay: `${200 + index * 150}ms` }}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
      <div className="absolute bottom-4 right-4 text-sm text-white/50 font-mono tracking-wider">
        {watermarkText}
      </div>
    </div>
  );
};

export default Slide;