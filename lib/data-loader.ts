import { FamilyTreeData, Person, House } from '@/lib/types'
import { HOUSE_COLORS } from '@/lib/constants/house-colors'
import { parseFamilyTreeData } from '@/lib/validation/family-tree'

interface DataIndexes {
    personById: Map<string, Person>
    houseById: Map<string, House>
    parentsByChild: Map<string, string[]>
    childrenByParent: Map<string, string[]>
    spousesByPerson: Map<string, string[]>
    partnersByPerson: Map<string, string[]>
    hasParent: Set<string>
}

const dataIndexCache = new WeakMap<FamilyTreeData, DataIndexes>()

function addUnique(map: Map<string, string[]>, key: string, value: string) {
    const values = map.get(key)
    if (!values) {
        map.set(key, [value])
        return
    }
    if (!values.includes(value)) {
        values.push(value)
    }
}

function buildDataIndexes(data: FamilyTreeData): DataIndexes {
    const personById = new Map<string, Person>(data.persons.map(person => [person.id, person]))
    const houseById = new Map<string, House>(data.houses.map(house => [house.id, house]))
    const parentsByChild = new Map<string, string[]>()
    const childrenByParent = new Map<string, string[]>()
    const spousesByPerson = new Map<string, string[]>()
    const partnersByPerson = new Map<string, string[]>()
    const hasParent = new Set<string>()

    data.relationships.forEach(rel => {
        if (rel.type === 'parent-child') {
            addUnique(parentsByChild, rel.child, rel.parent)
            addUnique(childrenByParent, rel.parent, rel.child)
            hasParent.add(rel.child)
            return
        }

        addUnique(partnersByPerson, rel.person1, rel.person2)
        addUnique(partnersByPerson, rel.person2, rel.person1)
        if (rel.type === 'spouse') {
            addUnique(spousesByPerson, rel.person1, rel.person2)
            addUnique(spousesByPerson, rel.person2, rel.person1)
        }
    })

    return {
        personById,
        houseById,
        parentsByChild,
        childrenByParent,
        spousesByPerson,
        partnersByPerson,
        hasParent,
    }
}

function getDataIndexes(data: FamilyTreeData): DataIndexes {
    const cached = dataIndexCache.get(data)
    if (cached) return cached

    const indexes = buildDataIndexes(data)
    dataIndexCache.set(data, indexes)
    return indexes
}

/**
 * Load and validate the family tree data (client-side fetch)
 */
export function normalizeFamilyTreeData(data: FamilyTreeData): FamilyTreeData {
    return {
        ...data,
        houses: data.houses.map(house => ({
            ...house,
            color: HOUSE_COLORS[house.id as keyof typeof HOUSE_COLORS] || house.color,
        })),
        relationships: data.relationships.map((rel, index) => ({
            ...rel,
            id: rel.id || `rel_${index}`,
        })),
    }
}

export async function loadFamilyTreeData(): Promise<FamilyTreeData> {
    const response = await fetch('/data/complete_lineage.json')
    if (!response.ok) {
        throw new Error(`Failed to load family tree data (${response.status})`)
    }
    const raw = await response.json()
    const data = parseFamilyTreeData(raw)
    return normalizeFamilyTreeData(data)
}

export function getPersonIndex(data: FamilyTreeData): ReadonlyMap<string, Person> {
    return getDataIndexes(data).personById
}

/**
 * Get a person by ID
 */
export function getPersonById(data: FamilyTreeData, id: string): Person | undefined {
    return getDataIndexes(data).personById.get(id)
}

/**
 * Get a house by ID
 */
export function getHouseById(data: FamilyTreeData, id: string): House | undefined {
    return getDataIndexes(data).houseById.get(id)
}

/**
 * Get house color by ID
 */
export function getHouseColor(data: FamilyTreeData, houseId: string | null): string {
    if (!houseId) return '#6b7280'
    const house = getHouseById(data, houseId)
    return HOUSE_COLORS[houseId as keyof typeof HOUSE_COLORS] || house?.color || '#6b7280'
}

/**
 * Get all relationships for a person
 */
export function getPersonRelationships(data: FamilyTreeData, personId: string) {
    return data.relationships.filter(rel => {
        if (rel.type === 'parent-child') {
            return rel.parent === personId || rel.child === personId
        }
        return rel.person1 === personId || rel.person2 === personId
    })
}

/**
 * Get parents of a person
 */
export function getParents(data: FamilyTreeData, personId: string) {
    const { parentsByChild, personById } = getDataIndexes(data)
    const parentIds = parentsByChild.get(personId) || []

    return parentIds
        .map(id => personById.get(id))
        .filter(Boolean) as Person[]
}

/**
 * Get children of a person
 */
export function getChildren(data: FamilyTreeData, personId: string) {
    const { childrenByParent, personById } = getDataIndexes(data)
    const childIds = childrenByParent.get(personId) || []

    return childIds
        .map(id => personById.get(id))
        .filter(Boolean) as Person[]
}

/**
 * Get spouses of a person
 */
export function getSpouses(data: FamilyTreeData, personId: string) {
    const { spousesByPerson, personById } = getDataIndexes(data)
    const spouseIds = spousesByPerson.get(personId) || []

    return spouseIds
        .map(id => personById.get(id))
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
    const { childrenByParent, hasParent } = getDataIndexes(data)
    const personChildren = new Map<string, string[]>(
        Array.from(childrenByParent.entries()).map(([id, children]) => [id, [...children]])
    )

    // Find root persons (no parents in dataset)
    const roots = data.persons.filter(p => !hasParent.has(p.id))

    return { roots, personChildren }
}

/**
 * Get spouse relationships as a map
 */
export function getSpouseMap(data: FamilyTreeData): Map<string, string[]> {
    const { partnersByPerson } = getDataIndexes(data)
    return new Map(
        Array.from(partnersByPerson.entries()).map(([id, partners]) => [id, [...partners]])
    )
}
