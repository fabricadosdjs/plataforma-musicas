// src/app/page.tsx
"use client";

import React, { useState } from 'react';
import { Search, User, Play, Pause, SkipBack, SkipForward, Volume2, ToggleLeft, ToggleRight } from 'lucide-react';

// Mock data - replace with real data from your API
const mockTracks = [
  { id: 1, title: "Summer Nights", artist: "DJ Shadow", bpm: 128, genre: "House", isPlaying: false },
  { id: 2, title: "Electric Dreams", artist: "Luna Bass", bpm: 132, genre: "Techno", isPlaying: false },
  { id: 3, title: "Midnight Groove", artist: "Alex Turner", bpm: 125, genre: "Deep House", isPlaying: false },
  { id: 4, title: "Neon Lights", artist: "Crystal Wave", bpm: 130, genre: "Progressive", isPlaying: false },
  { id: 5, title: "Urban Pulse", artist: "Metro Sound", bpm: 140, genre: "Tech House", isPlaying: false },
];

const mockPopular = [
  { id: 1, title: "Babylon", artist: "David Guetta", rank: 1 },
  { id: 2, title: "One More Time", artist: "Daft Punk", rank: 2 },
  { id: 3, title: "Levels", artist: "Avicii", rank: 3 },
  { id: 4, title: "Titanium", artist: "Sia", rank: 4 },
  { id: 5, title: "Animals", artist: "Martin Garrix", rank: 5 },
];

const featuredDJs = [
  "CALVIN HARRIS",
  "DAVID GUETTA", 
  "MARTIN GARRIX",
  "TIËSTO",
  "SKRILLEX"
];

export default function HomePage() {
  const [currentTrack, setCurrentTrack] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handlePlayPause = (trackId?: number) => {
    if (trackId) {
      setCurrentTrack(trackId);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-montserrat">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold">
                <span className="text-red-500">DJ</span>
                <span className="text-white">CITY</span>
              </h1>
            </div>

            {/* Navigation Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-white hover:text-red-500 transition-colors font-medium">Music</a>
              <a href="#" className="text-white hover:text-red-500 transition-colors font-medium">More</a>
              <a href="#" className="text-white hover:text-red-500 transition-colors font-medium">News</a>
            </div>

            {/* Search Bar */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tracks, artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-red-500 transition-colors w-40 sm:w-64"
                />
              </div>
              <button className="text-gray-400 hover:text-white transition-colors">
                <User className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16 flex flex-col lg:flex-row">
        {/* Main Content Area */}
        <div className="flex-1 p-4 sm:p-6">
          {/* Hero Section */}
          <div className="relative mb-8">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 sm:p-8 relative overflow-hidden">
              {/* NEW & NOTABLE Sticker */}
              <div className="absolute top-4 right-4 bg-[#9ef6d5] text-black px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transform rotate-3 shadow-lg">
                NEW & NOTABLE
              </div>
              
              <div className="space-y-1 sm:space-y-2">
                {featuredDJs.map((dj, index) => (
                  <h2 key={index} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                    {dj}
                  </h2>
                ))}
              </div>
            </div>
          </div>

          {/* Tracklist Section */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-white uppercase tracking-wider mb-4 sm:mb-6">Latest Tracks</h3>
            
            {mockTracks.map((track) => (
              <div key={track.id} className="bg-gray-900/50 rounded-lg p-3 sm:p-4 hover:bg-gray-900/80 transition-colors group">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  {/* Left Section - Play Button + Track Info */}
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <button
                      onClick={() => handlePlayPause(track.id)}
                      className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-200 group-hover:scale-105 flex-shrink-0"
                    >
                      {currentTrack === track.id && isPlaying ? (
                        <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                      ) : (
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 text-black ml-0.5" />
                      )}
                    </button>
                    
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base sm:text-lg font-bold text-white truncate">{track.title}</h4>
                      <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                    </div>
                  </div>

                  {/* Right Section - BPM + Genre */}
                  <div className="flex items-center space-x-3 sm:space-x-6 text-sm flex-shrink-0">
                    <span className="text-gray-300 font-medium hidden sm:inline">{track.bpm} BPM</span>
                    <span className="bg-red-500 text-white px-2 sm:px-3 py-1 rounded-lg font-medium uppercase tracking-wide text-xs sm:text-sm">
                      {track.genre}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 p-4 sm:p-6 lg:border-l border-gray-800">
          <div className="bg-gray-900/30 rounded-xl p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider mb-4 sm:mb-6">Most Popular</h3>
            
            <div className="space-y-3 sm:space-y-4">
              {mockPopular.map((track) => (
                <div key={track.id} className="flex items-center space-x-3 sm:space-x-4 hover:bg-gray-800/50 p-2 rounded-lg transition-colors">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs sm:text-sm">{track.rank}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold text-sm truncate">{track.title}</h4>
                    <p className="text-gray-400 text-xs truncate">{track.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Audio Player Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-3 sm:p-4">
        <div className="max-w-7xl mx-auto">
          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center justify-between">
            {/* Waveform Preview */}
            <div className="flex-1 max-w-md">
              <div className="flex items-center space-x-1 h-8">
                {Array.from({ length: 50 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-600 w-1 rounded-full transition-colors"
                    style={{
                      height: `${Math.random() * 20 + 10}px`,
                      backgroundColor: i < 20 ? '#ef4444' : '#6b7280'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Player Controls */}
            <div className="flex items-center space-x-4 mx-8">
              <button className="text-gray-400 hover:text-white transition-colors">
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={() => handlePlayPause()}
                className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white ml-0.5" />
                )}
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Volume and Autoplay */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-gray-400" />
                <div className="w-20 h-1 bg-gray-600 rounded-full">
                  <div className="w-3/5 h-full bg-red-500 rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Autoplay</span>
                <button
                  onClick={() => setAutoplay(!autoplay)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {autoplay ? (
                    <ToggleRight className="w-6 h-6 text-red-500" />
                  ) : (
                    <ToggleLeft className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between mb-3">
              {/* Player Controls */}
              <div className="flex items-center space-x-3">
                <button className="text-gray-400 hover:text-white transition-colors">
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePlayPause()}
                  className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 text-white" />
                  ) : (
                    <Play className="w-4 h-4 text-white ml-0.5" />
                  )}
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Volume and Autoplay */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-gray-400" />
                  <div className="w-12 h-1 bg-gray-600 rounded-full">
                    <div className="w-3/5 h-full bg-red-500 rounded-full"></div>
                  </div>
                </div>
                <button
                  onClick={() => setAutoplay(!autoplay)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {autoplay ? (
                    <ToggleRight className="w-5 h-5 text-red-500" />
                  ) : (
                    <ToggleLeft className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Waveform */}
            <div className="flex items-center space-x-1 h-6">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-600 w-1 rounded-full transition-colors flex-1"
                  style={{
                    height: `${Math.random() * 16 + 8}px`,
                    backgroundColor: i < 12 ? '#ef4444' : '#6b7280'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Padding for Player */}
      <div className="h-16 sm:h-20"></div>
    </div>
  );
}
