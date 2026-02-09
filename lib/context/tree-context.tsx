'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import type { ReactNode } from 'react'
import { FamilyTreeData, FilterState, ViewState, Person } from '@/lib/types'
import { loadFamilyTreeData, searchPersons } from '@/lib/data-loader'

// State interface
interface TreeState {
    data: FamilyTreeData | null;
    loading: boolean;
    error: string | null;
    filters: FilterState;
    view: ViewState;
    searchQuery: string;
    searchResults: Person[];
}

// Action types
type TreeAction =
    | { type: 'SET_DATA'; payload: FamilyTreeData }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string }
    | { type: 'SET_SELECTED_HOUSES'; payload: string[] }
    | { type: 'TOGGLE_FILTER'; payload: keyof Omit<FilterState, 'selectedHouses'> }
    | { type: 'SET_SELECTED_CHARACTER'; payload: string | null }
    | { type: 'SET_HIGHLIGHTED_PATH'; payload: string[] }
    | { type: 'SET_ZOOM'; payload: number }
    | { type: 'SET_PAN'; payload: { x: number; y: number } }
    | { type: 'SET_ORIENTATION'; payload: 'vertical' | 'horizontal' }
    | { type: 'SET_SEARCH_QUERY'; payload: string }
    | { type: 'SET_SEARCH_RESULTS'; payload: Person[] }
    | { type: 'RESET_VIEW' };

// Initial state
const initialState: TreeState = {
    data: null,
    loading: true,
    error: null,
    filters: {
        selectedHouses: [],
        showDeceased: true,
        showSecrets: true,
        showBastards: true,
    },
    view: {
        zoom: 1,
        panX: 0,
        panY: 0,
        orientation: 'vertical',
        selectedCharacter: null,
        highlightedPath: [],
    },
    searchQuery: '',
    searchResults: [],
};

// Reducer
function treeReducer(state: TreeState, action: TreeAction): TreeState {
    switch (action.type) {
        case 'SET_DATA':
            return { ...state, data: action.payload, loading: false };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        case 'SET_SELECTED_HOUSES':
            return { ...state, filters: { ...state.filters, selectedHouses: action.payload } };
        case 'TOGGLE_FILTER':
            return {
                ...state,
                filters: {
                    ...state.filters,
                    [action.payload]: !state.filters[action.payload],
                },
            };
        case 'SET_SELECTED_CHARACTER':
            return { ...state, view: { ...state.view, selectedCharacter: action.payload } };
        case 'SET_HIGHLIGHTED_PATH':
            return { ...state, view: { ...state.view, highlightedPath: action.payload } };
        case 'SET_ZOOM':
            return { ...state, view: { ...state.view, zoom: action.payload } };
        case 'SET_PAN':
            return { ...state, view: { ...state.view, panX: action.payload.x, panY: action.payload.y } };
        case 'SET_ORIENTATION':
            return { ...state, view: { ...state.view, orientation: action.payload } };
        case 'SET_SEARCH_QUERY':
            return { ...state, searchQuery: action.payload };
        case 'SET_SEARCH_RESULTS':
            return { ...state, searchResults: action.payload };
        case 'RESET_VIEW':
            return {
                ...state,
                filters: initialState.filters,
                view: initialState.view,
                searchQuery: '',
                searchResults: [],
            };
        default:
            return state;
    }
}

// Context
interface TreeContextType {
    state: TreeState;
    dispatch: React.Dispatch<TreeAction>;
    // Convenient actions
    selectHouses: (houses: string[]) => void;
    selectCharacter: (id: string | null) => void;
    toggleFilter: (filter: keyof Omit<FilterState, 'selectedHouses'>) => void;
    search: (query: string) => void;
    setZoom: (zoom: number) => void;
    setPan: (x: number, y: number) => void;
    toggleOrientation: () => void;
    highlightPath: (path: string[]) => void;
    resetView: () => void;
}

const TreeContext = createContext<TreeContextType | null>(null);

// Provider component
export function TreeProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(treeReducer, initialState);

    // Load data on mount
    useEffect(() => {
        async function fetchData() {
            try {
                const data = await loadFamilyTreeData();
                dispatch({ type: 'SET_DATA', payload: data });
            } catch (error) {
                dispatch({ type: 'SET_ERROR', payload: 'Failed to load family tree data' });
                console.error('Error loading data:', error);
            }
        }
        fetchData();
    }, []);

    // Convenient action creators
    const selectHouses = (houses: string[]) => {
        dispatch({ type: 'SET_SELECTED_HOUSES', payload: houses });
    };

    const selectCharacter = (id: string | null) => {
        dispatch({ type: 'SET_SELECTED_CHARACTER', payload: id });
    };

    const toggleFilter = (filter: keyof Omit<FilterState, 'selectedHouses'>) => {
        dispatch({ type: 'TOGGLE_FILTER', payload: filter });
    };

    const search = (query: string) => {
        dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
        if (state.data && query.trim()) {
            const results = searchPersons(state.data, query);
            dispatch({ type: 'SET_SEARCH_RESULTS', payload: results });
        } else {
            dispatch({ type: 'SET_SEARCH_RESULTS', payload: [] });
        }
    };

    const setZoom = (zoom: number) => {
        dispatch({ type: 'SET_ZOOM', payload: Math.max(0.25, Math.min(2, zoom)) });
    };

    const setPan = (x: number, y: number) => {
        dispatch({ type: 'SET_PAN', payload: { x, y } });
    };

    const highlightPath = (path: string[]) => {
        dispatch({ type: 'SET_HIGHLIGHTED_PATH', payload: path });
    };

    const toggleOrientation = () => {
        const newOrientation = state.view.orientation === 'vertical' ? 'horizontal' : 'vertical';
        dispatch({ type: 'SET_ORIENTATION', payload: newOrientation });
    };

    const resetView = () => {
        dispatch({ type: 'RESET_VIEW' });
    };

    return (
        <TreeContext.Provider
            value={{
                state,
                dispatch,
                selectHouses,
                selectCharacter,
                toggleFilter,
                search,
                setZoom,
                setPan,
                toggleOrientation,
                highlightPath,
                resetView,
            }}
        >
            {children}
        </TreeContext.Provider>
    );
}

// Custom hook
export function useTree() {
    const context = useContext(TreeContext);
    if (!context) {
        throw new Error('useTree must be used within a TreeProvider');
    }
    return context;
}
