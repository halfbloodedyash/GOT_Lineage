'use client'

import { memo, useMemo, useRef, useState, useCallback, useEffect } from 'react'
import { useTreeData, useTreeFilters, useTreeView } from '@/lib/context/tree-context'
import { getHouseColor, getSpouseMap, getPersonIndex } from '@/lib/data-loader'
import type { Person } from '@/lib/types'
import PersonCard from '@/components/visualization/PersonCard'

interface TreeNodeData {
    id: string
    person: Person
    children?: TreeNodeData[]
    _spouse?: Person
}

interface TreeNodeItemProps {
    node: TreeNodeData
    selectedCharacter: string | null
    highlightedIds: Set<string>
    getNodeColor: (person: Person) => string
    onSelect: (id: string) => void
}

const TreeNodeItem = memo(function TreeNodeItem({
    node,
    selectedCharacter,
    highlightedIds,
    getNodeColor,
    onSelect,
}: TreeNodeItemProps) {
    const children = node.children || []
    const hasChildren = children.length > 0
    const spouse = node._spouse
    const hasSpouse = Boolean(spouse)
    const isSelected = node.person.id === selectedCharacter
    const isHighlighted = highlightedIds.has(node.person.id)

    return (
        <li className="flex flex-col items-center relative pt-5">
            {/* Connector line from parent */}
            <div className="absolute top-0 left-1/2 w-px h-5 bg-line-blood -translate-x-1/2" />

            <div className="flex flex-col items-center">
                {/* Couple container */}
                {hasSpouse && spouse ? (
                    <div className="flex items-center gap-0">
                        <PersonCard
                            person={node.person}
                            houseColor={getNodeColor(node.person)}
                            isSelected={isSelected}
                            isHighlighted={isHighlighted}
                            hasChildren={hasChildren}
                            onSelect={onSelect}
                        />
                        <div className="w-8 h-0.5 bg-line-marriage" />
                        <PersonCard
                            person={spouse}
                            houseColor={getNodeColor(spouse)}
                            isSelected={spouse.id === selectedCharacter}
                            isHighlighted={highlightedIds.has(spouse.id)}
                            onSelect={onSelect}
                        />
                    </div>
                ) : (
                    <PersonCard
                        person={node.person}
                        houseColor={getNodeColor(node.person)}
                        isSelected={isSelected}
                        isHighlighted={isHighlighted}
                        hasChildren={hasChildren}
                        onSelect={onSelect}
                    />
                )}
            </div>

            {/* Children */}
            {hasChildren && (
                <ul
                    className="flex gap-4 mt-0 relative pt-5 before:content-[''] before:absolute before:top-0 before:left-1/2 before:w-px before:h-5 before:bg-line-blood before:-translate-x-1/2"
                    role="group"
                >
                    {/* Horizontal connector line */}
                    {children.length > 1 && (
                        <div
                            className="absolute top-5 h-px bg-line-blood"
                            style={{
                                left: '25%',
                                right: '25%',
                            }}
                        />
                    )}
                    {children.map(child => (
                        <TreeNodeItem
                            key={child.id}
                            node={child}
                            selectedCharacter={selectedCharacter}
                            highlightedIds={highlightedIds}
                            getNodeColor={getNodeColor}
                            onSelect={onSelect}
                        />
                    ))}
                </ul>
            )}
        </li>
    )
})

export default function FamilyTree() {
    const { data, loading, error } = useTreeData()
    const { filters } = useTreeFilters()
    const { view, selectCharacter, setZoom, setPan } = useTreeView()
    const containerRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

    const { zoom, panX, panY, orientation, highlightedPath, selectedCharacter } = view
    const highlightedIds = useMemo(() => new Set(highlightedPath), [highlightedPath])
    const personIndex = useMemo(() => (data ? getPersonIndex(data) : new Map<string, Person>()), [data])

    // Build hierarchical tree data
    const treeData = useMemo(() => {
        if (!data) return null

        const { persons, relationships } = data
        const selectedHouses = filters.selectedHouses
        const relationshipsForView = filters.showSecrets
            ? relationships
            : relationships.filter(rel => !rel.secret)

        // Build parent -> children map
        const childrenMap = new Map<string, string[]>()
        const hasParent = new Set<string>()

        relationshipsForView.forEach(rel => {
            if (rel.type === 'parent-child') {
                const children = childrenMap.get(rel.parent) || []
                if (!children.includes(rel.child)) {
                    children.push(rel.child)
                    childrenMap.set(rel.parent, children)
                }
                hasParent.add(rel.child)
            }
        })

        // Get spouse map
        const spouseMap = getSpouseMap({ ...data, relationships: relationshipsForView })

        // Filter persons by house
        if (selectedHouses.length === 0) {
            return null
        }
        let filteredPersons = persons.filter(p =>
            p.house && selectedHouses.includes(p.house)
        )

        // Filter by visibility
        if (!filters.showDeceased) {
            filteredPersons = filteredPersons.filter(p => p.status !== 'deceased')
        }
        if (!filters.showBastards) {
            filteredPersons = filteredPersons.filter(p => !p.bastard)
        }

        const personIds = new Set(filteredPersons.map(p => p.id))

        // Build child -> parents map (to check if parents are in filtered set)
        const parentsMap = new Map<string, string[]>()
        relationshipsForView.forEach(rel => {
            if (rel.type === 'parent-child') {
                const parents = parentsMap.get(rel.child) || []
                if (!parents.includes(rel.parent)) {
                    parents.push(rel.parent)
                    parentsMap.set(rel.child, parents)
                }
            }
        })

        // Find roots: persons without parents in the FILTERED dataset
        // (either no parents at all, or all parents are filtered out)
        const roots = filteredPersons.filter(p => {
            const parentIds = parentsMap.get(p.id) || []
            // No parents at all, or none of the parents are in the filtered set
            return parentIds.length === 0 || !parentIds.some(pid => personIds.has(pid))
        })

        const visiting = new Set<string>()
        const rendered = new Set<string>()

        // Build tree recursively
        const buildNode = (person: Person): TreeNodeData | null => {
            if (!personIds.has(person.id)) return null
            if (visiting.has(person.id)) return null
            if (rendered.has(person.id)) return null
            visiting.add(person.id)

            const childIds = childrenMap.get(person.id) || []
            const children = childIds
                .map(id => personIndex.get(id))
                .filter((p): p is Person => p !== undefined && personIds.has(p.id))
                .map(p => buildNode(p))
                .filter((n): n is TreeNodeData => n !== null)

            const spouseIds = spouseMap.get(person.id) || []
            const spouse = spouseIds.length > 0 ? personIndex.get(spouseIds[0]) : undefined
            visiting.delete(person.id)
            rendered.add(person.id)

            return {
                id: person.id,
                person,
                children: children.length > 0 ? children : undefined,
                _spouse: spouse,
            }
        }

        const trees = roots
            .map(p => buildNode(p))
            .filter((n): n is TreeNodeData => n !== null)

        return trees
    }, [data, filters, personIndex])

    // Get node color
    const getNodeColor = useCallback((person: Person) => {
        if (!data) return '#6b7280'
        if (person.status === 'deceased') return 'rgba(107, 114, 128, 0.6)'
        return getHouseColor(data, person.trueHouse || person.house)
    }, [data])

    // Mouse wheel zoom
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault()
            const delta = e.deltaY > 0 ? -0.1 : 0.1
            setZoom(zoom + delta)
        }

        container.addEventListener('wheel', handleWheel, { passive: false })
        return () => {
            container.removeEventListener('wheel', handleWheel)
        }
    }, [zoom, setZoom])

    // Drag to pan
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button !== 0) return
        setIsDragging(true)
        setDragStart({ x: e.clientX - panX, y: e.clientY - panY })
    }, [panX, panY])

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging) return
        setPan(e.clientX - dragStart.x, e.clientY - dragStart.y)
    }, [isDragging, dragStart, setPan])

    const handleMouseUp = useCallback(() => {
        setIsDragging(false)
    }, [])

    return (
        <div
            ref={containerRef}
            className={`absolute inset-0 overflow-hidden bg-transparent select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
            onClick={() => selectCharacter(null)}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Loading State */}
            {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-border border-t-accent-primary rounded-full animate-spin" />
                    <span className="text-text-muted">Loading family tree...</span>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-accent-secondary flex items-center gap-2">
                        <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                        >
                            <path d="M12 9v4" />
                            <path d="M12 17h.01" />
                            <path d="M10.3 3.3h3.4l8.3 14.4a2 2 0 01-1.7 3H3.7a2 2 0 01-1.7-3l8.3-14.4a2 2 0 011.7-.9z" />
                        </svg>
                        {error}
                    </span>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && !treeData && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center">
                    <svg
                        className="w-16 h-16 text-accent-primary"
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
                    <h3 className="text-xl text-accent-primary font-display uppercase">Select a House</h3>
                    <p className="text-text-muted max-w-xs">
                        Choose a house from the dropdown above to explore its family tree.
                    </p>
                </div>
            )}

            {/* Tree Content */}
            {treeData && treeData.length > 0 && (
                <div
                    className="absolute inset-0 flex items-start justify-center pt-20"
                    style={{
                        transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                        transformOrigin: 'center top',
                    }}
                >
                    <ul
                        className={`flex gap-8 ${orientation === 'horizontal' ? 'flex-col' : ''}`}
                        role="tree"
                        aria-label="Family tree"
                    >
                        {treeData.map(tree => (
                            <TreeNodeItem
                                key={tree.id}
                                node={tree}
                                selectedCharacter={selectedCharacter}
                                highlightedIds={highlightedIds}
                                getNodeColor={getNodeColor}
                                onSelect={selectCharacter}
                            />
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
