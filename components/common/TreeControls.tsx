'use client'

import { useTree } from '@/lib/context/tree-context'

export default function TreeControls() {
    const { state, setZoom, toggleOrientation, resetView } = useTree()
    const { zoom, orientation } = state.view

    const handleZoomIn = () => setZoom(zoom + 0.25)
    const handleZoomOut = () => setZoom(zoom - 0.25)
    const handleFitToScreen = () => setZoom(1)

    const buttonClass = "w-9 h-9 flex items-center justify-center rounded-sm border border-border bg-bg-secondary text-text-secondary hover:bg-surface-hover hover:text-text-primary hover:border-border-light disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
    const activeButtonClass = "bg-accent-glow border-accent-primary text-accent-primary"

    return (
        <div className="absolute bottom-4 right-4 z-dropdown flex items-center gap-1 p-1 bg-bg-secondary/95 backdrop-blur-sm border border-border rounded-sm shadow-lg">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
                <button
                    className={buttonClass}
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.25}
                    title="Zoom Out"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35M8 11h6" />
                    </svg>
                </button>
                <span className="w-12 text-center text-xs text-text-muted font-mono">
                    {Math.round(zoom * 100)}%
                </span>
                <button
                    className={buttonClass}
                    onClick={handleZoomIn}
                    disabled={zoom >= 2}
                    title="Zoom In"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
                    </svg>
                </button>
                <button
                    className={buttonClass}
                    onClick={handleFitToScreen}
                    title="Fit to Screen"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
                    </svg>
                </button>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-border mx-1" />

            {/* Orientation Controls */}
            <div className="flex items-center gap-1">
                <button
                    className={`${buttonClass} ${orientation === 'vertical' ? activeButtonClass : ''}`}
                    onClick={() => orientation !== 'vertical' && toggleOrientation()}
                    title="Vertical Layout"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 3v18M6 9l6-6 6 6" />
                    </svg>
                </button>
                <button
                    className={`${buttonClass} ${orientation === 'horizontal' ? activeButtonClass : ''}`}
                    onClick={() => orientation !== 'horizontal' && toggleOrientation()}
                    title="Horizontal Layout"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 12h18M9 6l-6 6 6 6" />
                    </svg>
                </button>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-border mx-1" />

            {/* Reset */}
            <button
                className={`${buttonClass} hover:text-accent-primary hover:border-accent-primary`}
                onClick={resetView}
                title="Reset View"
            >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 1018 0 9 9 0 00-18 0" />
                    <path d="M3 12h4M12 8v4l3 3" />
                </svg>
            </button>
        </div>
    )
}
