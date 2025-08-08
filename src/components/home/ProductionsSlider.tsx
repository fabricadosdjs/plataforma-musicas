"use client";

import { useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Track } from '@/types/track';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

// Componente para o Card de cada música no slider
function ProductionCard({ track }: { track: Track }) {
    return (
        <div className="relative flex-shrink-0 w-48 md:w-56 group">
            <div className="overflow-hidden rounded-lg shadow-lg aspect-square relative">
                <Image
                    src={track.imageUrl || '/images/placeholder-image.png'}
                    alt={`${track.songName} by ${track.artist}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="font-bold text-white text-md truncate" title={track.songName}>
                        {track.songName}
                    </h3>
                    <p className="text-sm text-gray-300 truncate" title={track.artist}>
                        {track.artist}
                    </p>
                </div>
            </div>
        </div>
    );
}


export default function ProductionsSlider() {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: 'start',
        containScroll: 'trimSnaps',
    });
    const [productions, setProductions] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    useEffect(() => {
        const fetchProductions = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/tracks?limit=15&page=1');
                if (!response.ok) {
                    throw new Error('Failed to fetch productions');
                }
                const data = await response.json();
                setProductions(data.tracks || []);
            } catch (error) {
                console.error("Error fetching productions:", error);
                setProductions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProductions();
    }, []);

    if (loading) {
        return (
            <div className="w-full h-64 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (productions.length === 0) {
        return null;
    }

    return (
        <section className="py-8 md:py-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white">Nossas Produções</h2>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={scrollPrev}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
                        aria-label="Anterior"
                    >
                        <ChevronLeft className="h-6 w-6 text-white" />
                    </button>
                    <button
                        onClick={scrollNext}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
                        aria-label="Próxima"
                    >
                        <ChevronRight className="h-6 w-6 text-white" />
                    </button>
                </div>
            </div>
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex space-x-4 md:space-x-6">
                    {productions.map((track) => (
                        <ProductionCard key={track.id} track={track} />
                    ))}
                </div>
            </div>
        </section>
    );
}
