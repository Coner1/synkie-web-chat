import React, { useCallback, useRef, useState, useEffect } from "react";
import clsx from "clsx";
import type { ChatMessage } from "~/types/chat";

export const MsgAudio = ({ message }: { message: ChatMessage }) => {
    const { content, file } = message;
    const mediaUrl = file?.url || content;

    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    // Fixed Toggle: Remove useCallback or add isPlaying to dependencies
    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(console.error);
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const total = audioRef.current.duration;
            setProgress((current / total) * 100);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) setDuration(audioRef.current.duration);
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-3 py-1 min-w-[200px]">
            <audio
                ref={audioRef}
                src={mediaUrl}
                onEnded={() => {
                    setIsPlaying(false);
                    setProgress(0);
                }}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                className="hidden"
            />

            {/* Play/Pause Button */}
            <button
                onClick={togglePlay}
                className="w-8 h-8 flex-shrink-0 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
            >
                {isPlaying ? (
                    <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
                        <rect x="0" y="0" width="3" height="12" rx="1" />
                        <rect x="7" y="0" width="3" height="12" rx="1" />
                    </svg>
                ) : (
                    <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor">
                        <path d="M1.5 0.75V13.25L11.25 7L1.5 0.75Z" />
                    </svg>
                )}
            </button>

            <div className="flex-1 flex flex-col gap-1.5 pt-1">
                {/* Progress Bar / Waveform Container */}
                <div className="relative h-4 flex items-end gap-0.5 group cursor-pointer"
                     onClick={(e) => {
                         // Simple seek logic
                         const rect = e.currentTarget.getBoundingClientRect();
                         const x = e.clientX - rect.left;
                         const pct = x / rect.width;
                         if (audioRef.current) audioRef.current.currentTime = pct * duration;
                     }}
                >
                    {[...Array(20)].map((_, i) => {
                        // Use a deterministic "random" height based on index so it doesn't jitter
                        const pseudoRandomHeight = 50;
                        const isPlayed = progress > (i / 20) * 100;
                        return (
                            <div
                                key={i}
                                className={clsx(
                                    "w-1 rounded-full transition-all duration-300",
                                    isPlayed ? "bg-current" : "bg-current opacity-20"
                                )}
                                style={{ height: `${pseudoRandomHeight}%` }}
                            />
                        );
                    })}
                </div>

                {/* Meta Info */}
                <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase tracking-tighter opacity-50">
                        Voice Message
                    </span>
                    <span className="text-[9px] font-mono font-bold opacity-70">
                        {isPlaying ? formatTime(audioRef.current?.currentTime || 0) : formatTime(duration)}
                    </span>
                </div>
            </div>
        </div>
    );
};
