"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Track } from '@/types/track';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

interface GenreHeroSliderProps {
    tracks: Track[];
    genreName: string;
}

export const GenreHeroSlider: React.FC<GenreHeroSliderProps> = ({ tracks, genreName }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);
    const { playTrack, currentTrack, isPlaying: globalIsPlaying } = useGlobalPlayer();

    // Filtrar apenas as primeiras 5 músicas para o slider
    const sliderTracks = tracks.slice(0, 5);

    useEffect(() => {
        // Auto-play do slider
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % sliderTracks.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [sliderTracks.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % sliderTracks.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + sliderTracks.length) % sliderTracks.length);
    };

    const handlePlayTrack = (track: Track) => {
        if (currentTrack?.id === track.id && globalIsPlaying) {
            // Se a música atual está tocando, pausar
            setIsPlaying(false);
        } else {
            // Tocar nova música
            playTrack(track);
            setIsPlaying(true);
        }
    };

    if (sliderTracks.length === 0) {
        return null;
    }

    return (
        <div className="relative w-full h-96 overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black">
            {/* Slider Container */}
            <div
                ref={sliderRef}
                className="relative w-full h-full flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {sliderTracks.map((track, index) => (
                    <div key={track.id} className="relative w-full h-full flex-shrink-0">
                        {/* Background Image */}
                        <div className="absolute inset-0">
                            {track.imageUrl && track.imageUrl !== '' && track.imageUrl !== 'undefined' ? (
                                <img
                                    src={track.imageUrl}
                                    alt={`${track.artist} - ${track.songName}`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                    <span className="text-white text-6xl">🎵</span>
                                </div>
                            )}
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/50"></div>
                        </div>

                        {/* Content */}
                        <div className="relative z-10 flex flex-col justify-end h-full p-8 text-white">
                            {/* Genre Badge */}
                            <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-4 w-fit">
                                {genreName}
                            </div>

                            {/* Track Info */}
                            <h2 className="text-4xl font-bold mb-2 line-clamp-2">
                                {track.songName}
                            </h2>
                            <p className="text-xl text-gray-300 mb-4">{track.artist}</p>

                            {/* Play Button */}
                            <button
                                onClick={() => handlePlayTrack(track)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
                            >
                                {currentTrack?.id === track.id && globalIsPlaying ? (
                                    <Pause className="w-8 h-8" />
                                ) : (
                                    <Play className="w-8 h-8 ml-1" />
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-20"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>

            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-20"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                {sliderTracks.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                                ? 'bg-white scale-125'
                                : 'bg-white/50 hover:bg-white/75'
                            }`}
                    />
                ))}
            </div>

            {/* Track Counter */}
            <div className="absolute top-6 right-6 bg-black/50 text-white px-3 py-2 rounded-full text-sm font-medium z-20">
                {currentSlide + 1} / {sliderTracks.length}
            </div>
        </div>
    );
};

export default GenreHeroSlider;


