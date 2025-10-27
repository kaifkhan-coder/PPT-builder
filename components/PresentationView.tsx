import React, { useState, useCallback, useEffect } from 'react';
import type { PresentationData } from '../types';
import Slide from './Slide';
import { ArrowLeftIcon, ArrowRightIcon, DownloadIcon } from './Icons';

// This tells TypeScript that PptxGenJS will be available as a global variable from the script tag in index.html
declare var PptxGenJS: any;

interface PresentationViewProps {
  presentation: PresentationData;
  onReset: () => void;
}

const urlToBase64 = async (url: string): Promise<string> => {
    try {
        // Use a proxy to bypass potential CORS issues
        const response = await fetch(`https://cors-anywhere.herokuapp.com/${url}`);
        if (!response.ok) {
            throw new Error(`Network response was not ok, status: ${response.status}`);
        }
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error(`Failed to fetch or convert image to base64: ${url}`, error);
        return ''; // Return empty string on failure
    }
};


const PresentationView: React.FC<PresentationViewProps> = ({ presentation, onReset }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const goToNext = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev + 1) % presentation.length);
  }, [presentation.length]);

  const goToPrev = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev - 1 + presentation.length) % presentation.length);
  }, [presentation.length]);
  
  const handleDownload = async () => {
    if (typeof PptxGenJS === 'undefined') {
      console.error('PptxGenJS is not loaded.');
      alert('Sorry, the presentation download library is not available.');
      return;
    }
    
    setIsDownloading(true);

    try {
        const pptx = new PptxGenJS();
        pptx.layout = 'LAYOUT_16x9';

        for (const slideData of presentation) {
            const slide = pptx.addSlide();

            // Add background image if available
            if (slideData.imageUrl) {
                const imageBase64 = await urlToBase64(slideData.imageUrl);
                if (imageBase64) {
                    slide.addImage({ data: imageBase64, x: 0, y: 0, w: '100%', h: '100%' });
                }
            }
            
            // Add a dark overlay for text readability, especially over images
             slide.addShape(pptx.shapes.RECTANGLE, { 
                x: 0, y: 0, w: '100%', h: '100%', 
                fill: { color: '000000', transparency: 60 } 
            });


            const titleY = slideData.layout === 'title_only' ? 2.5 : 0.5;

            // Add Title
            if (slideData.title && slideData.layout !== 'content_only') {
                slide.addText(slideData.title, { 
                    x: 0.5, 
                    y: titleY, 
                    w: '90%', 
                    h: 1.5, 
                    fontSize: 36, 
                    bold: true, 
                    color: '00A1D1', // cyan-300
                    align: 'center',
                    valign: 'middle'
                });
            }

            // Add Content (bullet points)
            if (slideData.content && slideData.content.length > 0 && slideData.layout !== 'title_only') {
                slide.addText(slideData.content.join('\n'), {
                    x: 1, 
                    y: 2, 
                    w: '80%', 
                    h: 3.5, 
                    fontSize: 18, 
                    color: 'F1F5F9', // slate-100
                    bullet: true,
                    align: 'left',
                });
            }

            // Add Watermark
            slide.addText('made with kaif', {
                x: '75%',
                y: '92%',
                w: '25%',
                h: '8%',
                fontSize: 10,
                color: 'A1A1AA', // zinc-400
                align: 'right',
            });
        }

        pptx.writeFile({ fileName: 'presentation.pptx' });
    } catch (error) {
        console.error("Failed to generate PPTX file:", error);
        alert("An error occurred while creating the presentation file.");
    } finally {
        setIsDownloading(false);
    }
  };

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
        <div className="flex items-center gap-4">
            <button onClick={onReset} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md transition-colors">
            Start Over
            </button>
            <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="inline-flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Download Presentation"
            >
                <DownloadIcon className="w-4 h-4" />
                {isDownloading ? 'Downloading...' : 'Download'}
            </button>
        </div>
        <span className="font-mono">{currentSlideIndex + 1} / {presentation.length}</span>
      </div>
    </div>
  );
};

export default PresentationView;