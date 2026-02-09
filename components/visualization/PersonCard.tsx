'use client'

import type { Person } from '@/lib/types'
import { getStatusColor } from '@/lib/utils/status'

interface PersonCardProps {
    person: Person
    houseColor: string
    isSelected?: boolean
    isHighlighted?: boolean
    hasChildren?: boolean
    onSelect: (id: string) => void
}

export default function PersonCard({
    person,
    houseColor,
    isSelected = false,
    isHighlighted = false,
    hasChildren,
    onSelect,
}: PersonCardProps) {
    const firstName = person.name.split(' ')[0]
    const restName = person.name.split(' ').slice(1).join(' ')
    const statusColor = getStatusColor(person.status)

    return (
        <button
            type="button"
            className={`tree-node relative flex flex-col items-center p-2 bg-surface border border-border rounded-sm cursor-pointer transition-all duration-200 hover:border-border-light hover:shadow-md min-w-[80px] focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-secondary ${isSelected ? 'selected ring-2 ring-accent-primary shadow-glow' : ''
                } ${isHighlighted ? 'ring-2 ring-accent-secondary shadow-glow' : ''} ${person.status === 'deceased' ? 'opacity-60' : ''} ${person.bastard ? 'border-dashed' : ''
                }`}
            onClick={(event) => {
                event.stopPropagation()
                onSelect(person.id)
            }}
            role="treeitem"
            aria-selected={isSelected}
            aria-expanded={hasChildren}
            aria-label={`${person.name}, ${person.status}`}
        >
            <div className="relative">
                <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-base font-display text-white shadow-md"
                    style={{ backgroundColor: houseColor }}
                >
                    {person.name.charAt(0)}
                </div>
                <span
                    className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-surface"
                    style={{ backgroundColor: statusColor }}
                />
            </div>
            <div className="mt-1.5 text-center">
                <span className="block text-xs font-medium text-text-primary truncate max-w-[70px]">
                    {firstName}
                </span>
                {restName && (
                    <span className="block text-[10px] text-text-muted truncate max-w-[70px]">
                        {restName}
                    </span>
                )}
            </div>
        </button>
    )
}
