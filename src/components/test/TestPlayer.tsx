import React from 'react';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';

const TestPlayer = () => {
    const { currentTrack, isPlaying, playTrack, togglePlayPause } = useGlobalPlayer();

    const testTrack = {
        id: 1,
        songName: "Test Song",
        artist: "Test Artist",
        style: "Test Style",
        downloadUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", // URL de teste
        previewUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        imageUrl: "",
        releaseDate: "",
        createdAt: "",
    updatedAt: "",
    __v: 0
    };

    return (
        <div className="fixed bottom-4 right-4 bg-gray-800 p-4 rounded-lg border border-gray-600 shadow-xl z-50">
            <h3 className="text-white font-bold mb-2">Test Player</h3>
            <div className="space-y-2">
                <button
                    onClick={() => playTrack(testTrack, [testTrack])}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Play Test Track
                </button>
                <button
                    onClick={togglePlayPause}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    {isPlaying ? 'Pause' : 'Play'} Current
                </button>
                {currentTrack && (
                    <div className="text-white text-sm">
                        <p>Current: {currentTrack.songName}</p>
                        <p>Status: {isPlaying ? 'Playing' : 'Paused'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestPlayer;
