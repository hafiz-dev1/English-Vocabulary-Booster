"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { vocabularyList } from "./data/vocabulary";
import VocabularyCard from "./components/VocabularyCard";
import Pagination from "./components/Pagination";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function Home() {
  const resultsRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showExamples, setShowExamples] = useState(true);
  const [showSpeaker, setShowSpeaker] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  useEffect(() => {
    const savedExamples = localStorage.getItem("showExamples");
    if (savedExamples !== null) {
      setShowExamples(JSON.parse(savedExamples));
    }
    const savedSpeaker = localStorage.getItem("showSpeaker");
    if (savedSpeaker !== null) {
      setShowSpeaker(JSON.parse(savedSpeaker));
    }
    const savedAutoScroll = localStorage.getItem("autoScroll");
    if (savedAutoScroll !== null) {
      setAutoScroll(JSON.parse(savedAutoScroll));
    }
  }, []);

  const toggleExamples = () => {
    const newValue = !showExamples;
    setShowExamples(newValue);
    localStorage.setItem("showExamples", JSON.stringify(newValue));
  };

  const toggleSpeaker = () => {
    const newValue = !showSpeaker;
    setShowSpeaker(newValue);
    localStorage.setItem("showSpeaker", JSON.stringify(newValue));
  };

  const toggleAutoScroll = () => {
    const newValue = !autoScroll;
    setAutoScroll(newValue);
    localStorage.setItem("autoScroll", JSON.stringify(newValue));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (autoScroll && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "all") {
      setItemsPerPage(vocabularyList.length);
    } else {
      setItemsPerPage(Number(value));
    }
    setCurrentPage(1);
  };

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
  const totalPages = Math.ceil(filteredVocab.length / itemsPerPage);
  const currentVocab = filteredVocab.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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
          {/* Toggles */}
          <div className="flex justify-center gap-3 flex-wrap">
            <button
              onClick={toggleSpeaker}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer border ${
                showSpeaker
                  ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                {showSpeaker ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                  />
                )}
              </svg>
              {showSpeaker ? "Speaker On" : "Speaker Off"}
            </button>

            <button
              onClick={toggleExamples}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer border ${
                showExamples
                  ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                {showExamples ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                )}
              </svg>
              {showExamples ? "Examples On" : "Examples Off"}
            </button>

            <button
              onClick={toggleAutoScroll}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer border ${
                autoScroll
                  ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                {autoScroll ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
                  />
                )}
              </svg>
              {autoScroll ? "Auto Scroll On" : "Auto Scroll Off"}
            </button>
          </div>

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

        {/* Results Info & Items Per Page */}
        <div ref={resultsRef} className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
            Showing {filteredVocab.length} words
            {selectedLetter && ` starting with "${selectedLetter}"`}
            {search && ` matching "${search}"`}
          </div>
          
          <div className="flex items-center gap-2">
            <label htmlFor="itemsPerPage" className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
              Show:
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage === vocabularyList.length ? "all" : itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 cursor-pointer"
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {currentVocab.length > 0 ? (
            currentVocab.map((item) => (
              <VocabularyCard 
                key={item.id} 
                item={item} 
                showExamples={showExamples}
                showSpeaker={showSpeaker}
              />
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
          onPageChange={handlePageChange}
        />

        <footer className="mt-20 text-center text-zinc-400 text-sm border-t border-zinc-200 dark:border-zinc-800 pt-8">
          <p>© {new Date().getFullYear()} English Vocabulary. Learning made simple.</p>
        </footer>
      </main>
    </div>
  );
}

