import React, { useState, useCallback, useRef } from 'react';
import type { AppState, PresentationData } from './types';
import { generatePresentationContent } from './services/geminiService';
import PresentationView from './components/PresentationView';
import Loader from './components/Loader';
import { FileUploadIcon, PromptIcon, ResetIcon, LinkIcon } from './components/Icons';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('idle');
  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const [prompt, setPrompt] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = useCallback(async (content: string) => {
    if (!content.trim()) {
      setError('Input cannot be empty.');
      return;
    }
    setAppState('loading');
    setError(null);
    try {
      const result = await generatePresentationContent(content);
      setPresentation(result);
      setAppState('presenting');
    } catch (e) {
      const err = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(err);
      setAppState('error');
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        handleGenerate(text);
      };
      reader.onerror = () => {
        setError('Failed to read the file.');
        setAppState('error');
      };
      reader.readAsText(file);
    }
  };

  const resetApp = () => {
    setAppState('idle');
    setPresentation(null);
    setPrompt('');
    setUrl('');
    setError(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const renderContent = () => {
    switch (appState) {
      case 'loading':
        return <Loader message="Building your animated presentation... This may take a moment." />;
      
      case 'presenting':
        return presentation && <PresentationView presentation={presentation} onReset={resetApp} />;
      
      case 'error':
        return (
          <div className="text-center p-8 bg-red-900/50 border border-red-700 rounded-lg">
            <h2 className="text-2xl font-bold text-red-300">An Error Occurred</h2>
            <p className="mt-2 text-red-200">{error}</p>
            <button
              onClick={resetApp}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-md transition-colors"
            >
              <ResetIcon className="w-5 h-5" /> Try Again
            </button>
          </div>
        );

      case 'prompting':
        return (
            <div className="w-full max-w-2xl mx-auto">
                 <h2 className="text-3xl font-bold text-center mb-4 text-cyan-300">Describe Your Presentation</h2>
                 <p className="text-center text-slate-400 mb-6">Enter a topic or a detailed prompt, and let AI do the rest.</p>
                <form onSubmit={(e) => { e.preventDefault(); handleGenerate(prompt); }}>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., 'A presentation on the history of space exploration'"
                        className="w-full h-40 p-4 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow"
                    />
                    <div className="flex justify-center gap-4 mt-4">
                        <button type="button" onClick={resetApp} className="px-6 py-2 bg-slate-600 hover:bg-slate-700 rounded-md transition-colors">Back</button>
                        <button type="submit" className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={!prompt.trim()}>
                            Generate
                        </button>
                    </div>
                </form>
            </div>
        );
      
      case 'url_prompting':
        return (
            <div className="w-full max-w-2xl mx-auto">
                 <h2 className="text-3xl font-bold text-center mb-4 text-cyan-300">Enter a URL</h2>
                 <p className="text-center text-slate-400 mb-6">Paste a link to a webpage, and AI will summarize it into a presentation.</p>
                <form onSubmit={(e) => { e.preventDefault(); handleGenerate(`Create a presentation based on the content of the following URL: ${url}`); }}>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com/article"
                        className="w-full p-4 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow"
                    />
                    <div className="flex justify-center gap-4 mt-4">
                        <button type="button" onClick={resetApp} className="px-6 py-2 bg-slate-600 hover:bg-slate-700 rounded-md transition-colors">Back</button>
                        <button type="submit" className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={!url.trim()}>
                            Generate
                        </button>
                    </div>
                </form>
            </div>
        );

      case 'idle':
      default:
        return (
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">AI Animated PPT Builder</h1>
            <p className="text-slate-400 text-lg mb-12">Create stunning presentations in seconds.</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Prompt Option */}
              <div onClick={() => setAppState('prompting')} className="p-8 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-cyan-500 hover:bg-slate-800 transition-all cursor-pointer transform hover:-translate-y-1">
                <PromptIcon className="w-16 h-16 mx-auto text-cyan-400 mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Generate from Prompt</h2>
                <p className="text-slate-400">Describe your topic, and our AI will craft a presentation for you.</p>
              </div>
              {/* File Upload Option */}
              <div onClick={() => fileInputRef.current?.click()} className="p-8 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-cyan-500 hover:bg-slate-800 transition-all cursor-pointer transform hover:-translate-y-1">
                <FileUploadIcon className="w-16 h-16 mx-auto text-cyan-400 mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Generate from File</h2>
                <p className="text-slate-400">Upload a text file, and we'll convert it into a polished presentation.</p>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt,.md" />
              </div>
              {/* URL Option */}
              <div onClick={() => setAppState('url_prompting')} className="p-8 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-cyan-500 hover:bg-slate-800 transition-all cursor-pointer transform hover:-translate-y-1">
                <LinkIcon className="w-16 h-16 mx-auto text-cyan-400 mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Generate from URL</h2>
                <p className="text-slate-400">Paste a link, and we'll summarize the content into a presentation.</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen w-full bg-slate-900 p-4 md:p-8 flex items-center justify-center transition-all duration-500">
        <div className={`w-full h-full max-w-7xl transition-all duration-500 ${appState === 'presenting' ? 'h-[80vh] aspect-video' : ''}`}>
            {renderContent()}
        </div>
    </main>
  );
};

export default App;