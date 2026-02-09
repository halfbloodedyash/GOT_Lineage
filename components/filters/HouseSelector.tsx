'use client'

import { useState, useRef, useEffect } from 'react'
import { useTree } from '@/lib/context/tree-context'

export default function HouseSelector() {
    const { state, selectHouses } = useTree()
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const houses = state.data?.houses || []
    const selectedHouses = state.filters.selectedHouses

    const handleSelect = (houseId: string) => {
        if (selectedHouses.includes(houseId)) {
            selectHouses(selectedHouses.filter(h => h !== houseId))
        } else {
            selectHouses([...selectedHouses, houseId])
        }
    }

    const getDisplayText = () => {
        if (selectedHouses.length === 0) {
            return 'Select a House'
        }
        if (selectedHouses.length === 1) {
            const house = houses.find(h => h.id === selectedHouses[0])
            return house?.name || 'Select House'
        }
        return `${selectedHouses.length} Houses Selected`
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="relative w-full max-w-xs" ref={containerRef}>
            {/* Trigger Button */}
            <button
                className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-gradient-to-b from-[#2c2c2c] to-[#1a1a1a] border border-border-gold rounded-sm text-text-primary font-display text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-glow ${isOpen ? 'border-accent-primary shadow-glow' : ''
                    }`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="truncate">{getDisplayText()}</span>
                <svg
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
                        }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-bg-secondary border border-border rounded-sm shadow-xl z-dropdown max-h-80 overflow-y-auto animate-fade-in">
                    {houses.map(house => (
                        <div
                            key={house.id}
                            className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors duration-150 ${selectedHouses.includes(house.id)
                                    ? 'bg-accent-glow border-l-2 border-l-accent-primary'
                                    : 'hover:bg-surface-hover border-l-2 border-l-transparent'
                                }`}
                            onClick={() => handleSelect(house.id)}
                        >
                            <span
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: house.color }}
                            />
                            <span className="flex-1 text-sm text-text-primary truncate">
                                {house.name}
                            </span>
                            <span
                                className={`text-xs px-2 py-0.5 rounded-full uppercase ${house.status === 'active'
                                        ? 'bg-status-alive/20 text-status-alive'
                                        : 'bg-status-deceased/20 text-status-deceased'
                                    }`}
                            >
                                {house.status}
                            </span>
                            {selectedHouses.includes(house.id) && (
                                <span className="text-accent-primary font-bold">✓</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
