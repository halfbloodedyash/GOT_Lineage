'use client'

import { useTreeData, useTreeView } from '@/lib/context/tree-context'
import SearchBar from '@/components/filters/SearchBar'
import HouseSelector from '@/components/filters/HouseSelector'

export default function Header() {
    const { data } = useTreeData()
    const { resetView } = useTreeView()

    return (
        <header className="flex items-center justify-between px-6 py-3 gap-6 h-20 relative z-dropdown bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] border-b-2 border-border-gold shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
            {/* Gold glow effect at bottom */}
            <div className="absolute bottom-[-5px] left-0 w-full h-[3px] bg-[radial-gradient(ellipse_at_center,rgba(201,162,39,0.5)_0%,transparent_70%)] pointer-events-none" />

            {/* Left - Logo */}
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    className="flex items-center gap-3 transition-opacity duration-150 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-secondary rounded-sm px-1"
                    onClick={resetView}
                    aria-label="Reset view"
                >
                    <svg
                        className="w-9 h-9 text-accent-primary drop-shadow-[0_0_8px_rgba(201,162,39,0.6)]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        aria-hidden="true"
                    >
                        <path d="M12 3c2.5 1.2 4 3.2 4 5.5 0 2.8-2.2 5-4 5.5-1.8-.5-4-2.7-4-5.5C8 6.2 9.5 4.2 12 3Z" />
                        <path d="M6 14c2 1 4 1.5 6 1.5S16 15 18 14" />
                        <path d="M6 14c-1.5 1-2 2.5-2 4.5M18 14c1.5 1 2 2.5 2 4.5" />
                    </svg>
                    <div className="flex flex-col leading-tight">
                        <h1 className="font-display text-2xl font-bold m-0 tracking-[0.1em] text-[#c9a227] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] border-none p-0">
                            GoT Lineage
                        </h1>
                        <span className="text-[0.7rem] text-accent-secondary uppercase tracking-[0.3em] font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                            Explorer
                        </span>
                    </div>
                </button>
            </div>

            {/* Center - House Selector */}
            <nav aria-label="Primary" className="flex-1 max-w-[500px] flex justify-center">
                <HouseSelector />
            </nav>

            {/* Right - Search & Stats */}
            <div className="flex items-center gap-4" role="search" aria-label="Site search">
                <SearchBar />
                <div className="hidden lg:flex gap-4">
                    {data && (
                        <>
                            <span className="text-sm text-text-muted flex items-center gap-1">
                                <strong className="text-text-primary font-semibold">
                                    {data.houses.length}
                                </strong>{' '}
                                Houses
                            </span>
                            <span className="text-sm text-text-muted flex items-center gap-1">
                                <strong className="text-text-primary font-semibold">
                                    {data.persons.length}
                                </strong>{' '}
                                Characters
                            </span>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
