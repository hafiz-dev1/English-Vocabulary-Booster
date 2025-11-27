"use client";

import { Vocabulary } from "../data/vocabulary";

interface VocabularyCardProps {
  item: Vocabulary;
}

export default function VocabularyCard({ item }: VocabularyCardProps) {
  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="group relative bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:shadow-xl hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all duration-300 flex flex-col h-full">
      <div className="flex justify-between items-start mb-3">
        <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {item.word}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => speak(item.word)}
            className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            aria-label="Listen to pronunciation"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
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
          {item.partOfSpeech && (
            <span className="px-3 py-1 text-xs font-medium uppercase tracking-wider text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded-full">
              {item.partOfSpeech}
            </span>
          )}
        </div>
      </div>

      <p className="text-lg text-zinc-600 dark:text-zinc-300 mb-4 font-medium">
        {item.translation}
      </p>

      {item.example && (
        <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 italic leading-relaxed">
            &quot;{item.example}&quot;
          </p>
        </div>
      )}
    </div>
  );
}
