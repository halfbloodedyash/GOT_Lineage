'use client'

import { useTree } from '@/lib/context/tree-context'
import SearchBar from '@/components/filters/SearchBar'
import HouseSelector from '@/components/filters/HouseSelector'

export default function Header() {
    const { state, resetView } = useTree()

    return (
        <header className="flex items-center justify-between px-6 py-3 gap-6 h-20 relative z-dropdown bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] border-b-2 border-border-gold shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
            {/* Gold glow effect at bottom */}
            <div className="absolute bottom-[-5px] left-0 w-full h-[3px] bg-[radial-gradient(ellipse_at_center,rgba(201,162,39,0.5)_0%,transparent_70%)] pointer-events-none" />

            {/* Left - Logo */}
            <div className="flex items-center gap-4">
                <div
                    className="flex items-center gap-3 cursor-pointer transition-opacity duration-150 hover:opacity-80"
                    onClick={resetView}
                >
                    <span className="text-[2.5rem] drop-shadow-[0_0_8px_rgba(201,162,39,0.6)] animate-pulse">
                        🐉
                    </span>
                    <div className="flex flex-col leading-tight">
                        <h1 className="font-display text-2xl font-bold m-0 tracking-[0.1em] text-[#c9a227] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] border-none p-0">
                            GoT Lineage
                        </h1>
                        <span className="text-[0.7rem] text-accent-secondary uppercase tracking-[0.3em] font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                            Explorer
                        </span>
                    </div>
                </div>
            </div>

            {/* Center - House Selector */}
            <div className="flex-1 max-w-[500px] flex justify-center">
                <HouseSelector />
            </div>

            {/* Right - Search & Stats */}
            <div className="flex items-center gap-4">
                <SearchBar />
                <div className="hidden lg:flex gap-4">
                    {state.data && (
                        <>
                            <span className="text-sm text-text-muted flex items-center gap-1">
                                <strong className="text-text-primary font-semibold">
                                    {state.data.houses.length}
                                </strong>{' '}
                                Houses
                            </span>
                            <span className="text-sm text-text-muted flex items-center gap-1">
                                <strong className="text-text-primary font-semibold">
                                    {state.data.persons.length}
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
