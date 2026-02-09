import { FamilyTreeData, Person, House } from '@/lib/types'

// House colors mapping
const HOUSE_COLORS: Record<string, string> = {
    stark: '#5c7689',
    lannister: '#c9a227',
    targaryen: '#a31621',
    baratheon: '#1a1a1a',
    greyjoy: '#2d3436',
    tyrell: '#27ae60',
    martell: '#e67e22',
    arryn: '#3498db',
    tully: '#16a085',
    bolton: '#8e44ad',
    frey: '#7f8c8d',
    mormont: '#2c3e50',
    tarly: '#8b4513',
    tarth: '#9b59b6',
    hightower: '#4a5568',
    velaryon: '#0ea5e9',
    strong: '#78350f',
}

/**
 * Load and validate the family tree data (client-side fetch)
 */
export async function loadFamilyTreeData(): Promise<FamilyTreeData> {
    const response = await fetch('/data/complete_lineage.json')
    const data = await response.json() as FamilyTreeData

    // Add IDs to relationships if missing
    data.relationships = data.relationships.map((rel, index) => ({
        ...rel,
        id: rel.id || `rel_${index}`,
    }))

    return data
}

/**
 * Get a person by ID
 */
export function getPersonById(data: FamilyTreeData, id: string): Person | undefined {
    return data.persons.find(p => p.id === id)
}

/**
 * Get a house by ID
 */
export function getHouseById(data: FamilyTreeData, id: string): House | undefined {
    return data.houses.find(h => h.id === id)
}

/**
 * Get house color by ID
 */
export function getHouseColor(data: FamilyTreeData, houseId: string | null): string {
    if (!houseId) return '#6b7280'
    const house = getHouseById(data, houseId)
    return house?.color || HOUSE_COLORS[houseId] || '#6b7280'
}

/**
 * Get all relationships for a person
 */
export function getPersonRelationships(data: FamilyTreeData, personId: string) {
    return data.relationships.filter(rel =>
        rel.parent === personId ||
        rel.child === personId ||
        rel.person1 === personId ||
        rel.person2 === personId
    )
}

/**
 * Get parents of a person
 */
export function getParents(data: FamilyTreeData, personId: string) {
    const parentRelations = data.relationships.filter(
        rel => rel.type === 'parent-child' && rel.child === personId
    )

    return parentRelations
        .map(rel => getPersonById(data, rel.parent!))
        .filter(Boolean) as Person[]
}

/**
 * Get children of a person
 */
export function getChildren(data: FamilyTreeData, personId: string) {
    const childRelations = data.relationships.filter(
        rel => rel.type === 'parent-child' && rel.parent === personId
    )

    return childRelations
        .map(rel => getPersonById(data, rel.child!))
        .filter(Boolean) as Person[]
}

/**
 * Get spouses of a person
 */
export function getSpouses(data: FamilyTreeData, personId: string) {
    const spouseRelations = data.relationships.filter(
        rel => rel.type === 'spouse' && (rel.person1 === personId || rel.person2 === personId)
    )

    return spouseRelations
        .map(rel => {
            const spouseId = rel.person1 === personId ? rel.person2 : rel.person1
            return getPersonById(data, spouseId!)
        })
        .filter(Boolean) as Person[]
}

/**
 * Get all members of a house
 */
export function getHouseMembers(data: FamilyTreeData, houseId: string) {
    return data.persons.filter(p =>
        p.house === houseId ||
        p.marriedInto === houseId ||
        p.trueHouse === houseId ||
        p.raisedAs === houseId
    )
}

/**
 * Search persons by name (fuzzy)
 */
export function searchPersons(data: FamilyTreeData, query: string) {
    const normalizedQuery = query.toLowerCase().trim()

    if (!normalizedQuery) return []

    return data.persons.filter(person => {
        const name = person.name.toLowerCase()
        const alias = person.alias?.toLowerCase() || ''

        return name.includes(normalizedQuery) || alias.includes(normalizedQuery)
    }).slice(0, 10)
}

/**
 * Build hierarchies for each major house
 * Returns map of house ID to root persons (those without parents in the dataset)
 */
export function buildHouseHierarchies(data: FamilyTreeData) {
    const personChildren = new Map<string, string[]>()
    const hasParent = new Set<string>()

    // Build parent -> children map
    data.relationships.forEach(rel => {
        if (rel.type === 'parent-child' && rel.parent && rel.child) {
            const children = personChildren.get(rel.parent) || []
            if (!children.includes(rel.child)) {
                children.push(rel.child)
                personChildren.set(rel.parent, children)
            }
            hasParent.add(rel.child)
        }
    })

    // Find root persons (no parents in dataset)
    const roots = data.persons.filter(p => !hasParent.has(p.id))

    return { roots, personChildren }
}

/**
 * Get spouse relationships as a map
 */
export function getSpouseMap(data: FamilyTreeData): Map<string, string[]> {
    const spouseMap = new Map<string, string[]>()

    data.relationships.forEach(rel => {
        if ((rel.type === 'spouse' || rel.type === 'betrothed') && rel.person1 && rel.person2) {
            const spouses1 = spouseMap.get(rel.person1) || []
            const spouses2 = spouseMap.get(rel.person2) || []

            if (!spouses1.includes(rel.person2)) spouses1.push(rel.person2)
            if (!spouses2.includes(rel.person1)) spouses2.push(rel.person1)

            spouseMap.set(rel.person1, spouses1)
            spouseMap.set(rel.person2, spouses2)
        }
    })

    return spouseMap
}
