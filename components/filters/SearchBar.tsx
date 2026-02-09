'use client'

import { useState, useRef, useEffect } from 'react'
import { useTree } from '@/lib/context/tree-context'

export default function SearchBar() {
    const { state, search, selectCharacter } = useTree()
    const [isOpen, setIsOpen] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        search(e.target.value)
        setIsOpen(true)
    }

    const handleSelect = (personId: string) => {
        selectCharacter(personId)
        search('')
        setIsOpen(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpen(false)
            inputRef.current?.blur()
        }
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

    const getHouseColor = (houseId: string) => {
        const house = state.data?.houses.find(h => h.id === houseId)
        return house?.color || '#6b7280'
    }

    return (
        <div className="relative" ref={containerRef}>
            {/* Search Input */}
            <div className="relative flex items-center">
                <svg
                    className="absolute left-3 w-4 h-4 text-text-muted pointer-events-none"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                    ref={inputRef}
                    type="text"
                    className="w-64 pl-10 pr-8 py-2 text-sm bg-black/30 border border-border rounded-sm text-text-primary placeholder:text-text-muted placeholder:italic focus:outline-none focus:border-accent-primary focus:bg-black/50 transition-all duration-300"
                    placeholder="Search characters..."
                    value={state.searchQuery}
                    onChange={handleInputChange}
                    onFocus={() => state.searchQuery && setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                />
                {state.searchQuery && (
                    <button
                        className="absolute right-2 w-5 h-5 flex items-center justify-center text-xs text-text-muted bg-border/50 rounded-full hover:bg-border hover:text-text-primary transition-all duration-150"
                        onClick={() => {
                            search('')
                            setIsOpen(false)
                        }}
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Search Results Dropdown */}
            {isOpen && state.searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-bg-secondary border border-border rounded-sm shadow-lg z-dropdown max-h-80 overflow-y-auto animate-fade-in">
                    {state.searchResults.map(person => (
                        <div
                            key={person.id}
                            className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-surface-hover transition-colors duration-150"
                            onClick={() => handleSelect(person.id)}
                        >
                            <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: getHouseColor(person.house || '') }}
                            />
                            <div className="flex-1 min-w-0">
                                <span className="text-sm text-text-primary truncate block">
                                    {person.name}
                                </span>
                                {person.alias && (
                                    <span className="text-xs text-text-muted italic truncate block">
                                        "{person.alias}"
                                    </span>
                                )}
                            </div>
                            <span
                                className={`w-2 h-2 rounded-full flex-shrink-0 ${person.status === 'alive'
                                        ? 'bg-status-alive'
                                        : person.status === 'deceased'
                                            ? 'bg-status-deceased'
                                            : person.status === 'imprisoned'
                                                ? 'bg-status-imprisoned'
                                                : 'bg-status-unknown'
                                    }`}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* No Results */}
            {isOpen && state.searchQuery && state.searchResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-bg-secondary border border-border rounded-sm shadow-lg z-dropdown">
                    <div className="px-4 py-3 text-sm text-text-muted text-center">
                        No characters found
                    </div>
                </div>
            )}
        </div>
    )
}
