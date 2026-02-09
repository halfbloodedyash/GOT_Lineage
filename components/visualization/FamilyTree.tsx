'use client'

import { useMemo, useRef, useState, useCallback } from 'react'
import { useTree } from '@/lib/context/tree-context'
import { getHouseColor, getSpouseMap, getPersonById } from '@/lib/data-loader'
import type { Person } from '@/lib/types'

interface TreeNodeData {
    id: string
    person: Person
    children?: TreeNodeData[]
    _spouse?: Person
}

export default function FamilyTree() {
    const { state, selectCharacter, setZoom, setPan } = useTree()
    const containerRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

    const { zoom, panX, panY, orientation } = state.view

    // Build hierarchical tree data
    const treeData = useMemo(() => {
        if (!state.data) return null

        const { persons, relationships } = state.data
        const selectedHouses = state.filters.selectedHouses

        // Build parent -> children map
        const childrenMap = new Map<string, string[]>()
        const hasParent = new Set<string>()

        relationships.forEach(rel => {
            if (rel.type === 'parent-child' && rel.parent && rel.child) {
                const children = childrenMap.get(rel.parent) || []
                if (!children.includes(rel.child)) {
                    children.push(rel.child)
                    childrenMap.set(rel.parent, children)
                }
                hasParent.add(rel.child)
            }
        })

        // Get spouse map
        const spouseMap = getSpouseMap(state.data)

        // Filter persons by house
        if (selectedHouses.length === 0) {
            return null
        }
        let filteredPersons = persons.filter(p =>
            p.house && selectedHouses.includes(p.house)
        )

        // Filter by visibility
        if (!state.filters.showDeceased) {
            filteredPersons = filteredPersons.filter(p => p.status !== 'deceased')
        }
        if (!state.filters.showBastards) {
            filteredPersons = filteredPersons.filter(p => !p.bastard)
        }

        const personIds = new Set(filteredPersons.map(p => p.id))

        // Build child -> parents map (to check if parents are in filtered set)
        const parentsMap = new Map<string, string[]>()
        relationships.forEach(rel => {
            if (rel.type === 'parent-child' && rel.parent && rel.child) {
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

        // Build tree recursively
        const buildNode = (person: Person): TreeNodeData | null => {
            if (!personIds.has(person.id)) return null

            const childIds = childrenMap.get(person.id) || []
            const children = childIds
                .map(id => getPersonById(state.data!, id))
                .filter((p): p is Person => p !== undefined && personIds.has(p.id))
                .map(p => buildNode(p))
                .filter((n): n is TreeNodeData => n !== null)

            const spouseIds = spouseMap.get(person.id) || []
            const spouse = spouseIds.length > 0 ? getPersonById(state.data!, spouseIds[0]) : undefined

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
    }, [state.data, state.filters])

    // Get node color
    const getNodeColor = (person: Person) => {
        if (!state.data) return '#6b7280'
        if (person.status === 'deceased') return 'rgba(107, 114, 128, 0.6)'
        return getHouseColor(state.data, person.trueHouse || person.house)
    }

    // Render a person card
    const renderPersonCard = (node: TreeNodeData) => {
        const { person } = node
        const isSelected = person.id === state.view.selectedCharacter
        const houseColor = getNodeColor(person)

        return (
            <div
                className={`relative flex flex-col items-center p-2 bg-surface border border-border rounded-sm cursor-pointer transition-all duration-200 hover:border-border-light hover:shadow-md min-w-[80px] ${isSelected ? 'ring-2 ring-accent-primary shadow-glow' : ''
                    } ${person.status === 'deceased' ? 'opacity-60' : ''} ${person.bastard ? 'border-dashed' : ''
                    }`}
                onClick={(e) => {
                    e.stopPropagation()
                    selectCharacter(person.id)
                }}
            >
                {/* Avatar */}
                <div className="relative">
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-base font-display text-white shadow-md"
                        style={{ backgroundColor: houseColor }}
                    >
                        {person.name.charAt(0)}
                    </div>
                    <span
                        className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-surface ${person.status === 'alive'
                            ? 'bg-status-alive'
                            : person.status === 'deceased'
                                ? 'bg-status-deceased'
                                : person.status === 'imprisoned'
                                    ? 'bg-status-imprisoned'
                                    : 'bg-status-unknown'
                            }`}
                    />
                </div>
                {/* Name */}
                <div className="mt-1.5 text-center">
                    <span className="block text-xs font-medium text-text-primary truncate max-w-[70px]">
                        {person.name.split(' ')[0]}
                    </span>
                    {person.name.split(' ').length > 1 && (
                        <span className="block text-[10px] text-text-muted truncate max-w-[70px]">
                            {person.name.split(' ').slice(1).join(' ')}
                        </span>
                    )}
                </div>
            </div>
        )
    }

    // Render a tree node with its children
    const renderTreeNode = (node: TreeNodeData) => {
        const hasChildren = node.children && node.children.length > 0
        const hasSpouse = node._spouse

        return (
            <li key={node.id} className="flex flex-col items-center relative pt-5">
                {/* Connector line from parent */}
                <div className="absolute top-0 left-1/2 w-px h-5 bg-line-blood -translate-x-1/2" />

                <div className="flex flex-col items-center">
                    {/* Couple container */}
                    {hasSpouse ? (
                        <div className="flex items-center gap-0">
                            {renderPersonCard(node)}
                            <div className="w-8 h-0.5 bg-line-marriage" />
                            <div
                                className={`relative flex flex-col items-center p-2 bg-surface border border-border rounded-sm cursor-pointer transition-all duration-200 hover:border-border-light hover:shadow-md min-w-[80px] ${node._spouse!.status === 'deceased' ? 'opacity-60' : ''
                                    }`}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    selectCharacter(node._spouse!.id)
                                }}
                            >
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-base font-display text-white shadow-md"
                                    style={{ backgroundColor: getNodeColor(node._spouse!) }}
                                >
                                    {node._spouse!.name.charAt(0)}
                                </div>
                                <div className="mt-1.5 text-center">
                                    <span className="block text-xs font-medium text-text-primary truncate max-w-[70px]">
                                        {node._spouse!.name.split(' ')[0]}
                                    </span>
                                    {node._spouse!.name.split(' ').length > 1 && (
                                        <span className="block text-[10px] text-text-muted truncate max-w-[70px]">
                                            {node._spouse!.name.split(' ').slice(1).join(' ')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        renderPersonCard(node)
                    )}
                </div>

                {/* Children */}
                {hasChildren && (
                    <ul className="flex gap-4 mt-0 relative pt-5 before:content-[''] before:absolute before:top-0 before:left-1/2 before:w-px before:h-5 before:bg-line-blood before:-translate-x-1/2">
                        {/* Horizontal connector line */}
                        {node.children!.length > 1 && (
                            <div
                                className="absolute top-5 h-px bg-line-blood"
                                style={{
                                    left: '25%',
                                    right: '25%',
                                }}
                            />
                        )}
                        {node.children!.map(child => renderTreeNode(child))}
                    </ul>
                )}
            </li>
        )
    }

    // Mouse wheel zoom
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        setZoom(zoom + delta)
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
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Loading State */}
            {state.loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-border border-t-accent-primary rounded-full animate-spin" />
                    <span className="text-text-muted">Loading family tree...</span>
                </div>
            )}

            {/* Error State */}
            {state.error && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-accent-secondary">⚠️ {state.error}</span>
                </div>
            )}

            {/* Empty State */}
            {!state.loading && !state.error && !treeData && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center">
                    <span className="text-6xl">🏰</span>
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
                    <ul className={`flex gap-8 ${orientation === 'horizontal' ? 'flex-col' : ''}`}>
                        {treeData.map(tree => renderTreeNode(tree))}
                    </ul>
                </div>
            )}
        </div>
    )
}
