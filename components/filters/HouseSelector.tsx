'use client'

import { useState, useRef, useEffect, useId, useMemo } from 'react'
import { useTreeData, useTreeFilters } from '@/lib/context/tree-context'
import { useClickOutside } from '@/lib/hooks/use-click-outside'

export default function HouseSelector() {
    const { data } = useTreeData()
    const { filters, selectHouses } = useTreeFilters()
    const [isOpen, setIsOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const listboxRef = useRef<HTMLDivElement>(null)
    const listboxId = useId()
    const buttonId = useId()

    const houses = data?.houses || []
    const selectedHouses = filters.selectedHouses
    const activeHouseId = useMemo(() => houses[activeIndex]?.id, [houses, activeIndex])

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

    useClickOutside(containerRef, () => setIsOpen(false), isOpen)

    useEffect(() => {
        if (!isOpen) return
        if (houses.length === 0) return
        setActiveIndex((prev) => Math.min(prev, houses.length - 1))
        listboxRef.current?.focus()
    }, [isOpen, houses.length])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            setIsOpen(true)
            return
        }
        if (!isOpen) return

        if (e.key === 'Escape') {
            e.preventDefault()
            setIsOpen(false)
            return
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIndex((prev) => Math.min(prev + 1, houses.length - 1))
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIndex((prev) => Math.max(prev - 1, 0))
        }
        if (e.key === 'Home') {
            e.preventDefault()
            setActiveIndex(0)
        }
        if (e.key === 'End') {
            e.preventDefault()
            setActiveIndex(houses.length - 1)
        }
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            if (activeHouseId) {
                handleSelect(activeHouseId)
            }
        }
    }

    return (
        <div className="relative w-full max-w-xs" ref={containerRef}>
            {/* Trigger Button */}
            <button
                id={buttonId}
                className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-gradient-to-b from-[#2c2c2c] to-[#1a1a1a] border border-border-gold rounded-sm text-text-primary font-display text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-glow focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-secondary ${isOpen ? 'border-accent-primary shadow-glow' : ''
                    }`}
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={handleKeyDown}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={listboxId}
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
                <div
                    id={listboxId}
                    role="listbox"
                    aria-labelledby={buttonId}
                    aria-activedescendant={activeHouseId ? `house-option-${activeHouseId}` : undefined}
                    tabIndex={-1}
                    ref={listboxRef}
                    className="absolute top-full left-0 right-0 mt-1 bg-bg-secondary border border-border rounded-sm shadow-xl z-dropdown max-h-80 overflow-y-auto animate-fade-in"
                    onKeyDown={handleKeyDown}
                >
                    {houses.map((house, index) => (
                        <div
                            key={house.id}
                            id={`house-option-${house.id}`}
                            role="option"
                            aria-selected={selectedHouses.includes(house.id)}
                            tabIndex={-1}
                            className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors duration-150 ${index === activeIndex ? 'bg-surface-hover' : ''} ${selectedHouses.includes(house.id)
                                    ? 'bg-accent-glow border-l-2 border-l-accent-primary'
                                    : 'hover:bg-surface-hover border-l-2 border-l-transparent'
                                }`}
                            onClick={() => handleSelect(house.id)}
                            onMouseEnter={() => setActiveIndex(index)}
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
