import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import clsx from 'clsx';
import type { UploadedFile } from '~/types/comment';

interface ImageLightboxProps {
    images: UploadedFile[];
    initialIndex: number;
    onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
                                                                images,
                                                                initialIndex,
                                                                onClose
                                                            }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') handlePrevious();
            if (e.key === 'ArrowRight') handleNext();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, images.length]);

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };

    const handleDownload = async () => {
        const image = images[currentIndex];
        try {
            const response = await fetch(image.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = image.name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    const currentImage = images[currentIndex];

    return (
        <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={onClose}
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            >
                <X size={24} />
            </button>

            {/* Download Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                }}
                className="absolute top-4 right-16 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            >
                <Download size={24} />
            </button>

            {/* Image Counter */}
            {images.length > 1 && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 text-white text-sm">
                    {currentIndex + 1} / {images.length}
                </div>
            )}

            {/* Main Image */}
            <div
                className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={currentImage.url}
                    alt={currentImage.name}
                    className="max-w-full max-h-full object-contain rounded-lg"
                />
            </div>

            {/* Navigation */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePrevious();
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                    >
                        <ChevronLeft size={32} />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleNext();
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                    >
                        <ChevronRight size={32} />
                    </button>
                </>
            )}

            {/* Thumbnail Strip */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-white/10 rounded-full backdrop-blur-sm">
                    {images.map((img, idx) => (
                        <button
                            key={img.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentIndex(idx);
                            }}
                            className={clsx(
                                "w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                                idx === currentIndex
                                    ? "border-white scale-110"
                                    : "border-white/30 opacity-60 hover:opacity-100"
                            )}
                        >
                            <img
                                src={img.url}
                                alt={img.name}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
