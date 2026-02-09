'use client'

import { useRef, useCallback } from 'react'
import { useTree } from '@/lib/context/tree-context'

export default function Minimap() {
    const { state, setPan, setZoom } = useTree()
    const minimapRef = useRef<HTMLDivElement>(null)
    const { zoom, panX, panY } = state.view

    // Constants for minimap dimensions
    const MINIMAP_WIDTH = 180
    const MINIMAP_HEIGHT = 120
    const TREE_ESTIMATE_WIDTH = 2000
    const TREE_ESTIMATE_HEIGHT = 1500

    // Calculate viewport rectangle size
    const viewportWidth = (MINIMAP_WIDTH / TREE_ESTIMATE_WIDTH) * (typeof window !== 'undefined' ? window.innerWidth : 1000) / zoom
    const viewportHeight = (MINIMAP_HEIGHT / TREE_ESTIMATE_HEIGHT) * (typeof window !== 'undefined' ? window.innerHeight : 800) / zoom

    // Calculate viewport position
    const viewportX = -(panX / TREE_ESTIMATE_WIDTH) * MINIMAP_WIDTH + (MINIMAP_WIDTH - viewportWidth) / 2
    const viewportY = -(panY / TREE_ESTIMATE_HEIGHT) * MINIMAP_HEIGHT + (MINIMAP_HEIGHT - viewportHeight) / 2

    // Handle click to jump to location
    const handleMinimapClick = useCallback((e: React.MouseEvent) => {
        if (!minimapRef.current) return

        const rect = minimapRef.current.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const clickY = e.clientY - rect.top

        const newPanX = -((clickX - MINIMAP_WIDTH / 2) / MINIMAP_WIDTH) * TREE_ESTIMATE_WIDTH
        const newPanY = -((clickY - MINIMAP_HEIGHT / 2) / MINIMAP_HEIGHT) * TREE_ESTIMATE_HEIGHT

        setPan(newPanX, newPanY)
    }, [setPan])

    const handleZoomToFit = () => {
        setZoom(1)
        setPan(0, 0)
    }

    if (state.loading || !state.data) return null

    // Generate minimap dots for each house
    const houseDots = state.data.houses.slice(0, 8).map((house, index) => {
        const angle = (index / 8) * Math.PI * 2
        const radius = 35
        const x = MINIMAP_WIDTH / 2 + Math.cos(angle) * radius
        const y = MINIMAP_HEIGHT / 2 + Math.sin(angle) * radius

        return (
            <div
                key={house.id}
                className="absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-sm"
                style={{
                    left: x,
                    top: y,
                    backgroundColor: house.color || '#6b7280',
                }}
                title={house.name}
            />
        )
    })

    return (
        <div
            className="absolute top-4 right-4 z-dropdown w-[180px] h-[120px] bg-bg-secondary/95 backdrop-blur-sm border border-border rounded-sm shadow-lg cursor-crosshair overflow-hidden"
            ref={minimapRef}
            onClick={handleMinimapClick}
        >
            {/* Minimap Content */}
            <div className="relative w-full h-full">
                {/* House markers */}
                {houseDots}

                {/* Viewport indicator */}
                <div
                    className="absolute border-2 border-accent-primary/60 bg-accent-primary/10 rounded-sm pointer-events-none"
                    style={{
                        width: Math.max(20, Math.min(viewportWidth, MINIMAP_WIDTH - 4)),
                        height: Math.max(15, Math.min(viewportHeight, MINIMAP_HEIGHT - 4)),
                        left: Math.max(2, Math.min(viewportX, MINIMAP_WIDTH - viewportWidth - 2)),
                        top: Math.max(2, Math.min(viewportY, MINIMAP_HEIGHT - viewportHeight - 2)),
                    }}
                />
            </div>

            {/* Reset Button */}
            <button
                className="absolute bottom-1 right-1 w-6 h-6 flex items-center justify-center text-sm bg-bg-secondary border border-border rounded-sm text-text-muted hover:text-text-primary hover:border-border-light transition-all duration-150"
                onClick={(e) => {
                    e.stopPropagation()
                    handleZoomToFit()
                }}
                title="Reset View"
            >
                ⟲
            </button>
        </div>
    )
}
