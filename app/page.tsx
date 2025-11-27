"use client";

import { useState, useMemo } from "react";
import { vocabularyList } from "./data/vocabulary";
import VocabularyCard from "./components/VocabularyCard";
import Pagination from "./components/Pagination";

const ITEMS_PER_PAGE = 12;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter logic
  const filteredVocab = useMemo(() => {
    return vocabularyList.filter((item) => {
      const matchesSearch =
        item.word.toLowerCase().includes(search.toLowerCase()) ||
        item.translation.toLowerCase().includes(search.toLowerCase());
      
      const matchesLetter = selectedLetter
        ? item.word.toUpperCase().startsWith(selectedLetter)
        : true;

      return matchesSearch && matchesLetter;
    });
  }, [search, selectedLetter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredVocab.length / ITEMS_PER_PAGE);
  const currentVocab = filteredVocab.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleLetterClick = (letter: string) => {
    if (selectedLetter === letter) {
      setSelectedLetter(null); // Deselect
    } else {
      setSelectedLetter(letter);
    }
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300">
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-linear-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent pb-2">
            English Vocabulary
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
            Master the English language with our curated collection of words.
            Explore, listen, and learn.
          </p>
        </div>

        {/* Controls Section */}
        <div className="mb-12 space-y-8">
          {/* Search Bar */}
          <div className="max-w-xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500 to-violet-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
              <input
                type="text"
                placeholder="Search words or translations..."
                value={search}
                onChange={handleSearchChange}
                className="relative w-full px-6 py-4 bg-white dark:bg-zinc-900 border-none rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg placeholder-zinc-400 dark:placeholder-zinc-600 transition-all"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Alphabet Filter */}
          <div className="flex flex-wrap justify-center gap-2">
            {ALPHABET.map((letter) => (
              <button
                key={letter}
                onClick={() => handleLetterClick(letter)}
                className={`w-8 h-8 md:w-10 md:h-10 rounded-lg text-sm md:text-base font-medium transition-all duration-200 cursor-pointer ${
                  selectedLetter === letter
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110"
                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800"
                }`}
              >
                {letter}
              </button>
            ))}
            {selectedLetter && (
              <button
                onClick={() => setSelectedLetter(null)}
                className="px-4 h-8 md:h-10 rounded-lg text-sm md:text-base font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6 text-zinc-500 dark:text-zinc-400 text-sm font-medium">
          Showing {filteredVocab.length} words
          {selectedLetter && ` starting with "${selectedLetter}"`}
          {search && ` matching "${search}"`}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentVocab.length > 0 ? (
            currentVocab.map((item) => (
              <VocabularyCard key={item.id} item={item} />
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-white dark:bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700">
              <p className="text-zinc-500 dark:text-zinc-500 text-xl">
                No words found matching your criteria.
              </p>
              <button 
                onClick={() => {setSearch(""); setSelectedLetter(null);}}
                className="mt-4 text-blue-600 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        <footer className="mt-20 text-center text-zinc-400 text-sm border-t border-zinc-200 dark:border-zinc-800 pt-8">
          <p>© {new Date().getFullYear()} English Vocabulary. Learning made simple.</p>
        </footer>
      </main>
    </div>
  );
}

