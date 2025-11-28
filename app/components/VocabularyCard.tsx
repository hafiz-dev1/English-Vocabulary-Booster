"use client";

import { useState, useRef } from "react";
import { Vocabulary } from "../types";

interface VocabularyCardProps {
  item: Vocabulary;
  showExamples: boolean;
  showSpeaker: boolean;
  showTranslation: boolean;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
}

export default function VocabularyCard({ item, showExamples, showSpeaker, showTranslation, isFavorite, onToggleFavorite }: VocabularyCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      onToggleFavorite(item.id);
    }, 800);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleMouseDown = () => {
    longPressTimer.current = setTimeout(() => {
      onToggleFavorite(item.id);
    }, 800);
  };

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    
    // Ensure US English voice is selected if available
    const voices = window.speechSynthesis.getVoices();
    const usVoice = voices.find((v: SpeechSynthesisVoice) => v.lang === 'en-US' || v.lang === 'en_US');
    if (usVoice) {
      utterance.voice = usVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`group relative bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl md:rounded-2xl px-5 py-2.5 md:p-6 hover:shadow-xl hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all duration-300 flex flex-col h-full`}>
      {/* Main Content: Word, Controls, Translation */}
      <div className={`flex-1 flex justify-between items-center gap-4 ${showExamples && item.example ? 'pb-3' : ''}`}>
        <div className="flex items-center gap-3">
          <h2 
            className="text-lg md:text-xl font-normal uppercase text-zinc-800 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-samsung cursor-pointer select-none"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onDoubleClick={() => onToggleFavorite(item.id)}
          >
            {item.word}
          </h2>
          
          {isFavorite && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-pink-500">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          )}
          
          <div className="flex items-center gap-2">
            {showSpeaker && (
              <button
                onClick={() => speak(item.word)}
                className="text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                aria-label="Listen to pronunciation"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                  />
                </svg>
              </button>
            )}
            {item.partOfSpeech && (
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                {item.partOfSpeech}
              </span>
            )}
          </div>
        </div>

        <div 
          className="flex flex-col items-end gap-1 max-w-[60%]"
          onMouseLeave={() => setIsRevealed(false)}
          onMouseUp={() => setIsRevealed(false)}
          onTouchEnd={() => setIsRevealed(false)}
          onTouchCancel={() => setIsRevealed(false)}
        >
          {showTranslation || isRevealed ? (
            item.translation.split(',').map((t, i, arr) => (
              <span 
                key={i} 
                className="text-base md:text-lg font-normal text-zinc-600 dark:text-white text-right leading-tight wrap-break-word text-balance select-none font-samsung"
              >
                {t.trim()}{i < arr.length - 1 ? ',' : ''}
              </span>
            ))
          ) : (
            <button
              onMouseDown={() => setIsRevealed(true)}
              onTouchStart={() => setIsRevealed(true)}
              className="text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer select-none"
              aria-label="Hold to show translation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Example */}
      {showExamples && item.example && (
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-base text-zinc-600 dark:text-zinc-300 italic leading-relaxed font-samsung">
            &quot;{item.example}&quot;
          </p>
        </div>
      )}
    </div>
  );
}
