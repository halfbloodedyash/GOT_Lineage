'use client'

import { useState, useRef, useEffect, useId } from 'react'
import { useTreeData, useTreeSearch, useTreeView } from '@/lib/context/tree-context'
import { useClickOutside } from '@/lib/hooks/use-click-outside'
import { getStatusColor } from '@/lib/utils/status'
import { getHouseColor as getHouseColorById } from '@/lib/data-loader'

export default function SearchBar() {
    const { data } = useTreeData()
    const { searchQuery, searchResults, search } = useTreeSearch()
    const { selectCharacter } = useTreeView()
    const [isOpen, setIsOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const listboxId = useId()

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
        if (e.key === 'ArrowDown' && searchResults.length > 0) {
            e.preventDefault()
            setIsOpen(true)
            setActiveIndex((prev) => Math.min(prev + 1, searchResults.length - 1))
            return
        }
        if (e.key === 'ArrowUp' && searchResults.length > 0) {
            e.preventDefault()
            setIsOpen(true)
            setActiveIndex((prev) => Math.max(prev - 1, 0))
            return
        }
        if ((e.key === 'Enter' || e.key === ' ') && isOpen && searchResults[activeIndex]) {
            e.preventDefault()
            handleSelect(searchResults[activeIndex].id)
            return
        }
        if (e.key === 'Escape') {
            setIsOpen(false)
            inputRef.current?.blur()
        }
    }

    useClickOutside(containerRef, () => setIsOpen(false), isOpen)

    useEffect(() => {
        if (!isOpen) return
        setActiveIndex((prev) => Math.min(prev, Math.max(0, searchResults.length - 1)))
    }, [isOpen, searchResults.length])

    const getHouseColor = (houseId: string) => {
        if (!data) return '#6b7280'
        return getHouseColorById(data, houseId)
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
                    className="w-64 pl-10 pr-8 py-2 text-sm bg-black/30 border border-border rounded-sm text-text-primary placeholder:text-text-muted placeholder:italic focus:outline-none focus:border-accent-primary focus:bg-black/50 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-secondary"
                    placeholder="Search characters..."
                    value={searchQuery}
                    onChange={handleInputChange}
                    onFocus={() => searchQuery && setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-controls={listboxId}
                    aria-autocomplete="list"
                    aria-haspopup="listbox"
                    aria-label="Search characters"
                    aria-activedescendant={
                        isOpen && searchResults[activeIndex]
                            ? `search-option-${searchResults[activeIndex].id}`
                            : undefined
                    }
                />
                {searchQuery && (
                    <button
                        className="absolute right-2 w-5 h-5 flex items-center justify-center text-xs text-text-muted bg-border/50 rounded-full hover:bg-border hover:text-text-primary transition-all duration-150 focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-secondary"
                        onClick={() => {
                            search('')
                            setIsOpen(false)
                        }}
                        aria-label="Clear search"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Search Results Dropdown */}
            {isOpen && searchResults.length > 0 && (
                <div
                    id={listboxId}
                    role="listbox"
                    className="absolute top-full left-0 right-0 mt-1 bg-bg-secondary border border-border rounded-sm shadow-lg z-dropdown max-h-80 overflow-y-auto animate-fade-in"
                >
                    {searchResults.map((person, index) => (
                        <div
                            key={person.id}
                            id={`search-option-${person.id}`}
                            role="option"
                            aria-selected={index === activeIndex}
                            className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors duration-150 ${index === activeIndex ? 'bg-surface-hover' : 'hover:bg-surface-hover'}`}
                            onClick={() => handleSelect(person.id)}
                            onMouseEnter={() => setActiveIndex(index)}
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
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: getStatusColor(person.status) }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* No Results */}
            {isOpen && searchQuery && searchResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-bg-secondary border border-border rounded-sm shadow-lg z-dropdown">
                    <div className="px-4 py-3 text-sm text-text-muted text-center">
                        No characters found
                    </div>
                </div>
            )}
        </div>
    )
}
