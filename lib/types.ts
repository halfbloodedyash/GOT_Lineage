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

export type Relationship =
    | {
        id?: string;
        type: 'parent-child';
        parent: string;
        child: string;
        secret?: boolean;
    }
    | {
        id?: string;
        type: 'spouse' | 'betrothed';
        person1: string;
        person2: string;
        secret?: boolean;
    }

export interface FamilyTreeData {
    houses: House[];
    persons: Person[];
    relationships: Relationship[];
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
