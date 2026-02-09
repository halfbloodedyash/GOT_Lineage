// TypeScript interfaces for GoT Family Tree

export interface House {
    id: string;
    name: string;
    seat: string;
    region: string;
    words: string | null;
    sigil: string;
    color?: string;
    status?: 'extinct' | 'active';
}

export interface Person {
    id: string;
    name: string;
    alias?: string;
    house: string | null;
    marriedInto?: string;
    trueHouse?: string;
    raisedAs?: string;
    gender: 'male' | 'female';
    titles?: string[];
    status: 'alive' | 'deceased' | 'imprisoned' | 'unknown';
    deathCause?: string;
    bastard?: boolean;
    legitimized?: boolean;
}

export interface Relationship {
    id?: string;
    parent?: string;
    child?: string;
    person1?: string;
    person2?: string;
    type: 'parent-child' | 'spouse' | 'betrothed';
    secret?: boolean;
}

export interface FamilyTreeData {
    houses: House[];
    persons: Person[];
    relationships: Relationship[];
}

// Hierarchical tree node for D3 hierarchy
export interface HierarchyPerson {
    id: string;
    person: Person;
    children?: HierarchyPerson[];
    spouse?: Person;
}

// Graph types for D3 visualization
export interface TreeNode {
    id: string;
    person: Person;
    x?: number;
    y?: number;
    fx?: number | null;
    fy?: number | null;
}

export interface TreeEdge {
    id: string;
    source: string | TreeNode;
    target: string | TreeNode;
    relationship: Relationship;
}

// UI State types
export interface FilterState {
    selectedHouses: string[];
    showDeceased: boolean;
    showSecrets: boolean;
    showBastards: boolean;
}

export interface ViewState {
    zoom: number;
    panX: number;
    panY: number;
    orientation: 'vertical' | 'horizontal';
    selectedCharacter: string | null;
    highlightedPath: string[];
}
