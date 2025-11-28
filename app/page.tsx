/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useMemo, useEffect, useRef, useLayoutEffect } from "react";
import Image from "next/image";
import { vocabularyList } from "./data/vocabulary";
import VocabularyCard from "./components/VocabularyCard";
import Pagination from "./components/Pagination";
import DateTimeDisplay from "./components/DateTimeDisplay";
import { useAuth } from "./context/AuthContext";
import { doc, getDoc, setDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "./lib/firebase";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function Home() {
  const { user, signInWithGoogle, logout } = useAuth();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showExamples, setShowExamples] = useState(true);
  const [showSpeaker, setShowSpeaker] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(30);
  const [view, setView] = useState<'vocabulary' | 'favorites'>('vocabulary');
  const [favorites, setFavorites] = useState<number[]>([]);

  const [notification, setNotification] = useState<{message: string, type: 'info' | 'error'} | null>(null);

  // Refs for scroll preservation
  const prevScrollHeight = useRef(0);
  const prevScrollPos = useRef(0);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const savedExamples = localStorage.getItem("showExamples");
    if (savedExamples !== null) {
      setShowExamples(JSON.parse(savedExamples));
    }
    const savedSpeaker = localStorage.getItem("showSpeaker");
    if (savedSpeaker !== null) {
      setShowSpeaker(JSON.parse(savedSpeaker));
    }
    const savedTranslation = localStorage.getItem("showTranslation");
    if (savedTranslation !== null) {
      setShowTranslation(JSON.parse(savedTranslation));
    }
    const savedAutoScroll = localStorage.getItem("autoScroll");
    if (savedAutoScroll !== null) {
      setAutoScroll(JSON.parse(savedAutoScroll));
    }
  }, []);

  // Sync favorites with Firestore when user logs in
  useEffect(() => {
    const syncFavorites = async () => {
      if (!user) {
        setFavorites([]);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFavorites(data.favorites || []);
        } else {
          setFavorites([]);
        }
      } catch (error) {
        console.error("Error syncing favorites:", error);
      }
    };

    syncFavorites();
  }, [user]);

  const toggleFavorite = async (id: number) => {
    if (!user) {
      setNotification({
        message: "Please login to save favorites",
        type: 'info'
      });
      return;
    }

    let newFavorites: number[];
    const isRemoving = favorites.includes(id);
    
    if (isRemoving) {
      newFavorites = favorites.filter(favId => favId !== id);
    } else {
      newFavorites = [...favorites, id];
    }

    setFavorites(newFavorites);

    // Sync with Firestore
    try {
      const userRef = doc(db, "users", user.uid);
      if (isRemoving) {
        await setDoc(userRef, { favorites: arrayRemove(id) }, { merge: true });
      } else {
        await setDoc(userRef, { favorites: arrayUnion(id) }, { merge: true });
      }
    } catch (error) {
      console.error("Error updating favorites in Firestore:", error);
      setNotification({
        message: "Failed to save to cloud",
        type: 'error'
      });
    }
  };

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

  const toggleTranslation = () => {
    const newValue = !showTranslation;
    setShowTranslation(newValue);
    localStorage.setItem("showTranslation", JSON.stringify(newValue));
  };

  const toggleAutoScroll = () => {
    const newValue = !autoScroll;
    setAutoScroll(newValue);
    localStorage.setItem("autoScroll", JSON.stringify(newValue));
  };

  const handlePageChange = (page: number) => {
    if (!autoScroll) {
      prevScrollHeight.current = document.documentElement.scrollHeight;
      prevScrollPos.current = window.scrollY;
    }
    setCurrentPage(page);
    if (autoScroll && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useLayoutEffect(() => {
    if (!autoScroll && prevScrollHeight.current > 0) {
      const newScrollHeight = document.documentElement.scrollHeight;
      const heightDifference = newScrollHeight - prevScrollHeight.current;
      
      // Adjust scroll to maintain position relative to the bottom
      if (heightDifference !== 0) {
        window.scrollTo({ 
          top: prevScrollPos.current + heightDifference, 
          behavior: 'instant' 
        });
      }
      prevScrollHeight.current = 0;
    }
  }, [currentPage, autoScroll]);

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
    let filtered = vocabularyList;

    if (view === 'favorites') {
      filtered = filtered.filter(item => favorites.includes(item.id));
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.word.toLowerCase().includes(searchLower) ||
          item.translation.toLowerCase().includes(searchLower)
      );
    } else if (selectedLetter) {
      filtered = filtered.filter((item) =>
        item.word.toUpperCase().startsWith(selectedLetter)
      );
    }

    return filtered;
  }, [search, selectedLetter, view, favorites]);

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
      {/* Notification Toast */}
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${notification ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className={`px-6 py-3 rounded-full shadow-lg flex items-center gap-3 ${
          notification?.type === 'error' 
            ? 'bg-red-500 text-white' 
            : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
        }`}>
          {notification?.type === 'info' && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
            </svg>
          )}
          <span className="font-medium text-sm">{notification?.message}</span>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12 max-w-7xl relative">
        
        {/* Auth Button */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
          {user ? (
            <div className="group flex items-center gap-3 pl-1.5 pr-4 py-1.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 ease-out">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || "User"} 
                  className="w-9 h-9 rounded-full ring-2 ring-white dark:ring-zinc-800 object-cover shadow-sm"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {user.displayName?.[0] || "U"}
                </div>
              )}
              
              <div className="flex flex-col hidden sm:flex">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 leading-none">
                  {user.displayName?.split(' ')[0]}
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                  Online
                </span>
              </div>

              <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block"></div>

              <button 
                onClick={logout}
                className="text-zinc-400 hover:text-red-500 transition-colors cursor-pointer p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30"
                title="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M16.5 3.75a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5.25a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3V9A.75.75 0 1 0 9 9V5.25a1.5 1.5 0 0 1 1.5-1.5h6ZM5.78 8.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 0 0 0 1.06l3 3a.75.75 0 0 0 1.06-1.06l-1.72-1.72H15a.75.75 0 0 0 0-1.5H4.06l1.72-1.72a.75.75 0 0 0 0-1.06Z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="group flex items-center gap-3 pl-2 pr-5 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <div className="bg-white p-1.5 rounded-full">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              <span className="text-sm font-semibold tracking-wide">Sign in</span>
            </button>
          )}
        </div>

        <DateTimeDisplay />

        {/* Header */}
        <div className="mb-12 text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-linear-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent pb-2">
            English Vocabulary Booster <span style={{ WebkitTextFillColor: "initial", color: "initial", background: "transparent", display: "inline-block" }}>🚀</span>
            </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
            Master the English language with our curated collection of words.
            Explore, listen, and learn.
          </p>

          {/* Navigation Menu */}
          <div className="flex justify-center mt-8">
            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
              <button
                onClick={() => {
                  setView('vocabulary');
                  setCurrentPage(1);
                }}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  view === 'vocabulary'
                    ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                Vocabulary
              </button>
              <button
                onClick={() => {
                  setView('favorites');
                  setCurrentPage(1);
                }}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  view === 'favorites'
                    ? 'bg-white dark:bg-zinc-700 text-pink-600 dark:text-pink-400 shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                Favorites
              </button>
            </div>
          </div>

          <p className="text-zinc-400 dark:text-zinc-500 text-sm text-center mt-4">
            Tip: Double-click or hold down a word to toggle favorites
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
              onClick={toggleTranslation}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer border ${
                showTranslation
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
                {showTranslation ? (
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
              {showTranslation ? "Translation On" : "Translation Off"}
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
                {search ? (
                  <button
                    onClick={() => {
                      setSearch("");
                      setCurrentPage(1);
                    }}
                    className="p-1 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                    aria-label="Clear search"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                )}
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
              <option value="30">30</option>
              <option value="60">60</option>
              <option value="120">120</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5 md:gap-6">
          {currentVocab.length > 0 ? (
            currentVocab.map((item) => (
              <VocabularyCard 
                key={item.id} 
                item={item} 
                showExamples={showExamples}
                showSpeaker={showSpeaker}
                showTranslation={showTranslation}
                isFavorite={favorites.includes(item.id)}
                onToggleFavorite={toggleFavorite}
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

        <footer className="mt-20 text-center text-zinc-400 text-sm border-t border-zinc-200 dark:border-zinc-800 pt-8 pb-8">
          <p className="mb-2">© {new Date().getFullYear()} English Vocabulary. Learning made simple.</p>
          <p className="mb-6 font-medium text-zinc-500 dark:text-zinc-400">Made by Hafiz Amrullah</p>
          
          <div className="flex justify-center gap-6">
            <a 
              href="mailto:hafiz.amrullah@yahoo.com"
              className="text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:scale-110"
              aria-label="Email"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
              </svg>
            </a>
            
            <a 
              href="https://instagram.com/hafizamrullah_"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-pink-600 dark:hover:text-pink-400 transition-all duration-300 hover:scale-110"
              aria-label="Instagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 2.53c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
              </svg>
            </a>

            <a 
              href="https://github.com/hafiz-dev1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-300 hover:scale-110"
              aria-label="GitHub"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}

