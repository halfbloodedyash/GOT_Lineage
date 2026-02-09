'use client'

import { useMemo } from 'react'
import { useTree } from '@/lib/context/tree-context'
import { getPersonById, getHouseById, getParents, getChildren, getSpouses } from '@/lib/data-loader'

export default function CharacterDetail() {
    const { state, selectCharacter } = useTree()
    const { data, view } = state

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
            <aside className="side-panel hidden lg:flex flex-col items-center justify-center p-8 text-center">
                <span className="text-5xl mb-4">👤</span>
                <h3 className="text-lg font-display uppercase text-accent-primary mb-2">Select a Character</h3>
                <p className="text-sm text-text-muted">
                    Click on any character in the family tree to view their details.
                </p>
            </aside>
        )
    }

    const getStatusBadge = (status: string) => {
        const config = {
            alive: { icon: '🟢', label: 'Alive', class: 'bg-status-alive/20 text-status-alive' },
            deceased: { icon: '⚫', label: 'Deceased', class: 'bg-status-deceased/20 text-status-deceased' },
            imprisoned: { icon: '🟠', label: 'Imprisoned', class: 'bg-status-imprisoned/20 text-status-imprisoned' },
            unknown: { icon: '🔵', label: 'Unknown', class: 'bg-status-unknown/20 text-status-unknown' },
        }
        return config[status as keyof typeof config] || config.unknown
    }

    const statusBadge = getStatusBadge(character.status)

    return (
        <aside className="side-panel hidden lg:block animate-fade-in">
            {/* Close Button */}
            <button
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-sm transition-colors z-10"
                onClick={handleClose}
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
                            <span className="absolute -top-2 -right-2 text-2xl">👑</span>
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
                <span className={`mt-3 px-3 py-1 text-xs rounded-full ${statusBadge.class}`}>
                    {statusBadge.icon} {statusBadge.label}
                </span>
            </header>

            {/* Content */}
            <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                {/* Bastard Badge */}
                {character.bastard && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-accent-secondary/10 border border-accent-secondary/30 rounded-sm text-sm text-text-secondary">
                        <span>⚔️</span>
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
                        <h4 className="text-sm font-display uppercase text-status-deceased mb-1 border-none p-0">⚰️ Death</h4>
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
                            🏰 {house.name}
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
