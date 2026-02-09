'use client'

import { useState } from 'react'
import { useTree } from '@/lib/context/tree-context'

export default function FilterPanel() {
    const { state, toggleFilter } = useTree()
    const [isExpanded, setIsExpanded] = useState(true)

    const { showDeceased, showSecrets, showBastards } = state.filters

    return (
        <div
            className={`absolute top-4 left-4 z-dropdown bg-bg-secondary/95 backdrop-blur-sm border border-border rounded-sm shadow-lg transition-all duration-300 ${isExpanded ? 'w-56' : 'w-auto'
                }`}
        >
            {/* Toggle Header */}
            <button
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-display uppercase tracking-wider text-text-primary hover:bg-surface-hover transition-colors duration-150"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M3 4h18M7 12h10M10 20h4" />
                </svg>
                <span>Filters</span>
                <svg
                    className={`w-4 h-4 ml-auto transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''
                        }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Filter Options */}
            {isExpanded && (
                <div className="px-3 pb-3 space-y-2 border-t border-border/50">
                    {/* Show Deceased */}
                    <label className="flex items-center gap-3 py-2 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={showDeceased}
                            onChange={() => toggleFilter('showDeceased')}
                            className="sr-only"
                        />
                        <span
                            className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${showDeceased ? 'bg-accent-primary' : 'bg-border'
                                }`}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${showDeceased ? 'translate-x-5' : ''
                                    }`}
                            />
                        </span>
                        <span className="flex items-center gap-2 text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                            <span className="w-2 h-2 rounded-full bg-status-deceased" />
                            Show Deceased
                        </span>
                    </label>

                    {/* Show Bastards */}
                    <label className="flex items-center gap-3 py-2 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={showBastards}
                            onChange={() => toggleFilter('showBastards')}
                            className="sr-only"
                        />
                        <span
                            className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${showBastards ? 'bg-accent-primary' : 'bg-border'
                                }`}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${showBastards ? 'translate-x-5' : ''
                                    }`}
                            />
                        </span>
                        <span className="flex items-center gap-2 text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                            <span className="text-accent-primary">★</span>
                            Show Bastards
                        </span>
                    </label>

                    {/* Show Secrets */}
                    <label className="flex items-center gap-3 py-2 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={showSecrets}
                            onChange={() => toggleFilter('showSecrets')}
                            className="sr-only"
                        />
                        <span
                            className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${showSecrets ? 'bg-accent-primary' : 'bg-border'
                                }`}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${showSecrets ? 'translate-x-5' : ''
                                    }`}
                            />
                        </span>
                        <span className="flex items-center gap-2 text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                            🔒
                            Show Secrets
                        </span>
                    </label>
                </div>
            )}
        </div>
    )
}
