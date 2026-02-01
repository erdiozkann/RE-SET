import { useState, useEffect, useRef } from 'react';

// ============================================
// 🖼️ OPTIMIZED IMAGE COMPONENT
// ============================================
// Progressive loading with blur-up effect

interface OptimizedImageProps {
    src: string;
    alt: string;
    className?: string;
    priority?: boolean;
    onLoad?: () => void;
}

export default function OptimizedImage({
    src,
    alt,
    className = '',
    priority = false,
    onLoad
}: OptimizedImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    // Check if image is already cached
    useEffect(() => {
        if (imgRef.current?.complete && imgRef.current?.naturalHeight !== 0) {
            setIsLoaded(true);
        }
    }, []);

    // Preload priority images
    useEffect(() => {
        if (priority && src) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);

            return () => {
                document.head.removeChild(link);
            };
        }
    }, [priority, src]);

    const handleLoad = () => {
        setIsLoaded(true);
        onLoad?.();
    };

    const handleError = () => {
        setHasError(true);
    };

    if (hasError) {
        return (
            <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
                <i className="ri-image-line text-gray-400 text-4xl"></i>
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Skeleton / Placeholder */}
            {!isLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 animate-pulse">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
            )}

            {/* Actual Image */}
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                onLoad={handleLoad}
                onError={handleError}
                loading={priority ? 'eager' : 'lazy'}
                decoding={priority ? 'sync' : 'async'}
                fetchPriority={priority ? 'high' : 'auto'}
            />
        </div>
    );
}
