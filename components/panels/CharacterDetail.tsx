'use client'

import { useMemo } from 'react'
import { useTreeData, useTreeView } from '@/lib/context/tree-context'
import { getPersonById, getHouseById, getParents, getChildren, getSpouses } from '@/lib/data-loader'
import { getStatusBadgeStyle, getStatusLabel } from '@/lib/utils/status'

export default function CharacterDetail() {
    const { data } = useTreeData()
    const { view, selectCharacter } = useTreeView()
    const isOpen = Boolean(view.selectedCharacter)

    const character = useMemo(() => {
        if (!data || !view.selectedCharacter) return null
        return getPersonById(data, view.selectedCharacter)
    }, [data, view.selectedCharacter])

    const house = useMemo(() => {
        if (!data || !character) return null
        const houseId = character.trueHouse ?? character.house
        if (!houseId) return null
        return getHouseById(data, houseId)
    }, [data, character])

    const parents = useMemo(() => {
        if (!data || !character) return []
        return getParents(data, character.id)
    }, [data, character])

    const children = useMemo(() => {
        if (!data || !character) return []
        return getChildren(data, character.id)
    }, [data, character])

    const spouses = useMemo(() => {
        if (!data || !character) return []
        return getSpouses(data, character.id)
    }, [data, character])

    const handleClose = () => {
        selectCharacter(null)
    }

    const handleRelationClick = (personId: string) => {
        selectCharacter(personId)
    }

    // Empty State
    if (!character) {
        return (
            <aside className={`side-panel ${isOpen ? 'open' : ''} flex flex-col items-center justify-center p-8 text-center`}>
                <svg
                    className="w-12 h-12 text-text-muted mb-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c2-4 6-6 8-6s6 2 8 6" />
                </svg>
                <h3 className="text-lg font-display uppercase text-accent-primary mb-2">Select a Character</h3>
                <p className="text-sm text-text-muted">
                    Click on any character in the family tree to view their details.
                </p>
            </aside>
        )
    }

    const statusBadgeStyle = getStatusBadgeStyle(character.status)
    const statusLabel = getStatusLabel(character.status)

    return (
        <aside className={`side-panel ${isOpen ? 'open' : ''} animate-fade-in`}>
            {/* Close Button */}
            <button
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-sm transition-colors z-10 focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-secondary"
                onClick={handleClose}
                aria-label="Close character details"
            >
                ✕
            </button>

            {/* Header */}
            <header
                className="p-6 border-b-2 flex flex-col items-center text-center"
                style={{ borderColor: house?.color || '#4a4a4a' }}
            >
                {/* Avatar */}
                <div className="relative mb-4">
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-display text-white shadow-lg"
                        style={{ backgroundColor: house?.color || '#6b7280' }}
                    >
                        {character.name[0]}
                    </div>
                    {character.titles?.some(t =>
                        t.toLowerCase().includes('king') || t.toLowerCase().includes('queen')
                    ) && (
                            <svg
                                className="absolute -top-2 -right-2 w-6 h-6 text-accent-primary"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path d="M3 7l4 3 5-6 5 6 4-3-2 13H5L3 7z" />
                            </svg>
                        )}
                </div>

                {/* Identity */}
                <h2 className="text-xl font-display uppercase text-accent-primary mb-1 border-none p-0">
                    {character.name}
                </h2>
                {character.alias && (
                    <span className="text-sm text-text-muted italic mb-2">"{character.alias}"</span>
                )}
                <span className="text-sm" style={{ color: house?.color }}>
                    {house?.name || character.house}
                </span>

                {/* Status Badge */}
                <span className="mt-3 px-3 py-1 text-xs rounded-full inline-flex items-center gap-2" style={statusBadgeStyle}>
                    <span className="w-2 h-2 rounded-full bg-current" aria-hidden="true" />
                    {statusLabel}
                </span>
            </header>

            {/* Content */}
            <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                {/* Bastard Badge */}
                {character.bastard && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-accent-secondary/10 border border-accent-secondary/30 rounded-sm text-sm text-text-secondary">
                        <svg
                            className="w-4 h-4 text-accent-secondary"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                        >
                            <path d="M3 3l7 7-2 2-7-7 2-2z" />
                            <path d="M14 14l7 7-2 2-7-7 2-2z" />
                            <path d="M5 7l4-4M15 17l4-4" />
                        </svg>
                        {character.legitimized ? 'Legitimized Bastard' : 'Bastard Born'}
                    </div>
                )}

                {/* Titles */}
                {character.titles && character.titles.length > 0 && (
                    <section>
                        <h4 className="text-sm font-display uppercase text-text-muted mb-2 border-none p-0">Titles</h4>
                        <ul className="space-y-1">
                            {character.titles.map((title, i) => (
                                <li key={i} className="text-sm text-text-secondary pl-2 border-l border-border-gold">
                                    {title}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* Death */}
                {character.status === 'deceased' && character.deathCause && (
                    <section className="p-3 bg-status-deceased/10 border border-status-deceased/30 rounded-sm">
                        <h4 className="text-sm font-display uppercase text-status-deceased mb-1 border-none p-0 flex items-center gap-2">
                            <svg
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                aria-hidden="true"
                            >
                                <rect x="3" y="8" width="18" height="10" rx="2" />
                                <path d="M8 8V6h8v2" />
                                <path d="M7 13h10" />
                            </svg>
                            Death
                        </h4>
                        <p className="text-sm text-text-secondary">{character.deathCause}</p>
                    </section>
                )}

                {/* Family */}
                <section>
                    <h4 className="text-sm font-display uppercase text-text-muted mb-3 border-none p-0">Family</h4>

                    {/* Parents */}
                    {parents.length > 0 && (
                        <div className="mb-3">
                            <span className="text-xs text-text-muted uppercase tracking-wider">Parents</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {parents.map(parent => parent && (
                                    <button
                                        key={parent.id}
                                        className="px-2 py-1 text-xs bg-surface border border-border rounded-sm hover:border-accent-primary hover:text-accent-primary transition-colors"
                                        onClick={() => handleRelationClick(parent.id)}
                                    >
                                        {parent.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Spouses */}
                    {spouses.length > 0 && (
                        <div className="mb-3">
                            <span className="text-xs text-text-muted uppercase tracking-wider">Spouse(s)</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {spouses.map(spouse => spouse && (
                                    <button
                                        key={spouse.id}
                                        className="px-2 py-1 text-xs bg-accent-secondary/10 border border-accent-secondary/30 text-accent-secondary rounded-sm hover:bg-accent-secondary/20 transition-colors"
                                        onClick={() => handleRelationClick(spouse.id)}
                                    >
                                        {spouse.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Children */}
                    {children.length > 0 && (
                        <div className="mb-3">
                            <span className="text-xs text-text-muted uppercase tracking-wider">Children</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {children.map(child => child && (
                                    <button
                                        key={child.id}
                                        className="px-2 py-1 text-xs bg-surface border border-border rounded-sm hover:border-accent-primary hover:text-accent-primary transition-colors"
                                        onClick={() => handleRelationClick(child.id)}
                                    >
                                        {child.name}
                                        {child.bastard && <span className="text-accent-primary ml-1">*</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {parents.length === 0 && spouses.length === 0 && children.length === 0 && (
                        <p className="text-sm text-text-muted italic">No known family connections</p>
                    )}
                </section>

                {/* House Info */}
                {house && (
                    <section className="p-3 bg-surface border border-border rounded-sm">
                        <h4 className="text-sm font-display uppercase mb-2 border-none p-0" style={{ color: house.color }}>
                            <span className="inline-flex items-center gap-2">
                                <svg
                                    className="w-4 h-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    aria-hidden="true"
                                >
                                    <path d="M3 20h18" />
                                    <path d="M5 20V9l4-3 3 3 3-3 4 3v11" />
                                    <path d="M9 20v-5h6v5" />
                                    <path d="M9 7V4h6v3" />
                                </svg>
                                {house.name}
                            </span>
                        </h4>
                        {house.words && (
                            <p className="text-sm italic text-text-secondary mb-2">"{house.words}"</p>
                        )}
                        <div className="text-xs text-text-muted space-y-1">
                            <div><strong>Seat:</strong> {house.seat}</div>
                            <div><strong>Region:</strong> {house.region}</div>
                        </div>
                    </section>
                )}
            </div>
        </aside>
    )
}
