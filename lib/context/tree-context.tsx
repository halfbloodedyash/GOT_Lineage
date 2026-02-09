'use client'

import { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { FamilyTreeData, FilterState, ViewState, Person } from '@/lib/types'
import { loadFamilyTreeData, searchPersons } from '@/lib/data-loader'

const INITIAL_FILTERS: FilterState = {
    selectedHouses: [],
    showDeceased: true,
    showSecrets: true,
    showBastards: true,
}

const INITIAL_VIEW: ViewState = {
    zoom: 1,
    panX: 0,
    panY: 0,
    orientation: 'vertical',
    selectedCharacter: null,
    highlightedPath: [],
}

interface DataContextType {
    data: FamilyTreeData | null
    loading: boolean
    error: string | null
}

interface FilterContextType {
    filters: FilterState
    selectHouses: (houses: string[]) => void
    toggleFilter: (filter: keyof Omit<FilterState, 'selectedHouses'>) => void
}

interface ViewContextType {
    view: ViewState
    selectCharacter: (id: string | null) => void
    setZoom: (zoom: number) => void
    setPan: (x: number, y: number) => void
    toggleOrientation: () => void
    highlightPath: (path: string[]) => void
    resetView: () => void
}

interface SearchContextType {
    searchQuery: string
    searchResults: Person[]
    search: (query: string) => void
}

const DataContext = createContext<DataContextType | null>(null)
const FilterContext = createContext<FilterContextType | null>(null)
const ViewContext = createContext<ViewContextType | null>(null)
const SearchContext = createContext<SearchContextType | null>(null)

export function TreeProvider({
    children,
    initialData,
}: {
    children: ReactNode
    initialData?: FamilyTreeData | null
}) {
    const [data, setData] = useState<FamilyTreeData | null>(initialData ?? null)
    const [loading, setLoading] = useState(!initialData)
    const [error, setError] = useState<string | null>(null)
    const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS)
    const [view, setView] = useState<ViewState>(INITIAL_VIEW)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<Person[]>([])

    useEffect(() => {
        if (initialData) return

        let cancelled = false
        async function fetchData() {
            try {
                const loadedData = await loadFamilyTreeData()
                if (cancelled) return
                setData(loadedData)
                setLoading(false)
            } catch (loadError) {
                if (cancelled) return
                setError('Failed to load family tree data')
                setLoading(false)
                console.error('Error loading data:', loadError)
            }
        }

        fetchData()
        return () => {
            cancelled = true
        }
    }, [initialData])

    const selectHouses = useCallback((houses: string[]) => {
        setFilters(prev => ({ ...prev, selectedHouses: houses }))
    }, [])

    const toggleFilter = useCallback((filter: keyof Omit<FilterState, 'selectedHouses'>) => {
        setFilters(prev => ({ ...prev, [filter]: !prev[filter] }))
    }, [])

    const selectCharacter = useCallback((id: string | null) => {
        setView(prev => ({ ...prev, selectedCharacter: id }))
    }, [])

    const setZoom = useCallback((zoom: number) => {
        setView(prev => ({ ...prev, zoom: Math.max(0.25, Math.min(2, zoom)) }))
    }, [])

    const setPan = useCallback((x: number, y: number) => {
        setView(prev => ({ ...prev, panX: x, panY: y }))
    }, [])

    const toggleOrientation = useCallback(() => {
        setView(prev => ({
            ...prev,
            orientation: prev.orientation === 'vertical' ? 'horizontal' : 'vertical',
        }))
    }, [])

    const highlightPath = useCallback((path: string[]) => {
        setView(prev => ({ ...prev, highlightedPath: path }))
    }, [])

    const search = useCallback((query: string) => {
        setSearchQuery(query)

        if (data && query.trim()) {
            setSearchResults(searchPersons(data, query))
            return
        }
        setSearchResults([])
    }, [data])

    const resetView = useCallback(() => {
        setFilters(INITIAL_FILTERS)
        setView(INITIAL_VIEW)
        setSearchQuery('')
        setSearchResults([])
    }, [])

    const dataValue = useMemo<DataContextType>(() => ({
        data,
        loading,
        error,
    }), [data, loading, error])

    const filterValue = useMemo<FilterContextType>(() => ({
        filters,
        selectHouses,
        toggleFilter,
    }), [filters, selectHouses, toggleFilter])

    const viewValue = useMemo<ViewContextType>(() => ({
        view,
        selectCharacter,
        setZoom,
        setPan,
        toggleOrientation,
        highlightPath,
        resetView,
    }), [view, selectCharacter, setZoom, setPan, toggleOrientation, highlightPath, resetView])

    const searchValue = useMemo<SearchContextType>(() => ({
        searchQuery,
        searchResults,
        search,
    }), [searchQuery, searchResults, search])

    return (
        <DataContext.Provider value={dataValue}>
            <FilterContext.Provider value={filterValue}>
                <ViewContext.Provider value={viewValue}>
                    <SearchContext.Provider value={searchValue}>
                        {children}
                    </SearchContext.Provider>
                </ViewContext.Provider>
            </FilterContext.Provider>
        </DataContext.Provider>
    )
}

export function useTreeData() {
    const context = useContext(DataContext)
    if (!context) {
        throw new Error('useTreeData must be used within a TreeProvider')
    }
    return context
}

export function useTreeFilters() {
    const context = useContext(FilterContext)
    if (!context) {
        throw new Error('useTreeFilters must be used within a TreeProvider')
    }
    return context
}

export function useTreeView() {
    const context = useContext(ViewContext)
    if (!context) {
        throw new Error('useTreeView must be used within a TreeProvider')
    }
    return context
}

export function useTreeSearch() {
    const context = useContext(SearchContext)
    if (!context) {
        throw new Error('useTreeSearch must be used within a TreeProvider')
    }
    return context
}
