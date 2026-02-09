'use client'

import { useState } from 'react'
import { useTreeFilters } from '@/lib/context/tree-context'

export default function FilterPanel() {
    const { filters, toggleFilter } = useTreeFilters()
    const [isExpanded, setIsExpanded] = useState(true)

    const { showDeceased, showSecrets, showBastards } = filters

    return (
        <div
            className={`absolute top-4 left-4 z-dropdown bg-bg-secondary/95 backdrop-blur-sm border border-border rounded-sm shadow-lg transition-all duration-300 ${isExpanded ? 'w-56' : 'w-auto'
                }`}
        >
            {/* Toggle Header */}
            <button
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-display uppercase tracking-wider text-text-primary hover:bg-surface-hover transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-secondary rounded-sm"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
                aria-controls="filter-panel-options"
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
                <div id="filter-panel-options" className="px-3 pb-3 space-y-2 border-t border-border/50">
                    {/* Show Deceased */}
                    <label className="flex items-center gap-3 py-2 cursor-pointer group focus-within:ring-2 focus-within:ring-accent-primary focus-within:ring-offset-2 focus-within:ring-offset-bg-secondary rounded-sm px-1">
                        <input
                            type="checkbox"
                            checked={showDeceased}
                            onChange={() => toggleFilter('showDeceased')}
                            className="sr-only"
                            role="switch"
                            aria-checked={showDeceased}
                            aria-label="Show deceased"
                        />
                        <span
                            className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${showDeceased ? 'bg-accent-primary' : 'bg-border'
                                }`}
                            aria-hidden="true"
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${showDeceased ? 'translate-x-5' : ''
                                    }`}
                                aria-hidden="true"
                            />
                        </span>
                        <span className="flex items-center gap-2 text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                            <span className="w-2 h-2 rounded-full bg-status-deceased" />
                            Show Deceased
                        </span>
                    </label>

                    {/* Show Bastards */}
                    <label className="flex items-center gap-3 py-2 cursor-pointer group focus-within:ring-2 focus-within:ring-accent-primary focus-within:ring-offset-2 focus-within:ring-offset-bg-secondary rounded-sm px-1">
                        <input
                            type="checkbox"
                            checked={showBastards}
                            onChange={() => toggleFilter('showBastards')}
                            className="sr-only"
                            role="switch"
                            aria-checked={showBastards}
                            aria-label="Show bastards"
                        />
                        <span
                            className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${showBastards ? 'bg-accent-primary' : 'bg-border'
                                }`}
                            aria-hidden="true"
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${showBastards ? 'translate-x-5' : ''
                                    }`}
                                aria-hidden="true"
                            />
                        </span>
                        <span className="flex items-center gap-2 text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                            <svg
                                className="w-3 h-3 text-accent-primary"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.6-6.2 3.6 1.6-7-5.4-4.7 7.1-.6L12 2z" />
                            </svg>
                            Show Bastards
                        </span>
                    </label>

                    {/* Show Secrets */}
                    <label className="flex items-center gap-3 py-2 cursor-pointer group focus-within:ring-2 focus-within:ring-accent-primary focus-within:ring-offset-2 focus-within:ring-offset-bg-secondary rounded-sm px-1">
                        <input
                            type="checkbox"
                            checked={showSecrets}
                            onChange={() => toggleFilter('showSecrets')}
                            className="sr-only"
                            role="switch"
                            aria-checked={showSecrets}
                            aria-label="Show secrets"
                        />
                        <span
                            className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${showSecrets ? 'bg-accent-primary' : 'bg-border'
                                }`}
                            aria-hidden="true"
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${showSecrets ? 'translate-x-5' : ''
                                    }`}
                                aria-hidden="true"
                            />
                        </span>
                        <span className="flex items-center gap-2 text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                            <svg
                                className="w-3.5 h-3.5 text-text-muted"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                aria-hidden="true"
                            >
                                <rect x="5" y="11" width="14" height="10" rx="2" />
                                <path d="M8 11V8a4 4 0 018 0v3" />
                            </svg>
                            Show Secrets
                        </span>
                    </label>
                </div>
            )}
        </div>
    )
}
