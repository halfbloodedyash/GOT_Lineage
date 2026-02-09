import type { FamilyTreeData, House, Person, Relationship } from '@/lib/types'

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

function expectString(value: unknown, field: string): string {
    if (typeof value !== 'string') {
        throw new Error(`Invalid field "${field}": expected string`)
    }
    return value
}

function expectOptionalString(value: unknown, field: string): string | undefined {
    if (value === undefined) return undefined
    if (typeof value !== 'string') {
        throw new Error(`Invalid field "${field}": expected string`)
    }
    return value
}

function expectNullableString(value: unknown, field: string): string | null {
    if (value === null) return null
    return expectString(value, field)
}

function expectOptionalBoolean(value: unknown, field: string): boolean | undefined {
    if (value === undefined) return undefined
    if (typeof value !== 'boolean') {
        throw new Error(`Invalid field "${field}": expected boolean`)
    }
    return value
}

function parseHouse(raw: unknown, index: number): House {
    if (!isRecord(raw)) {
        throw new Error(`Invalid house at index ${index}`)
    }

    const status = raw.status
    if (status !== undefined && status !== 'active' && status !== 'extinct') {
        throw new Error(`Invalid house status at index ${index}`)
    }

    return {
        id: expectString(raw.id, `houses[${index}].id`),
        name: expectString(raw.name, `houses[${index}].name`),
        seat: expectString(raw.seat, `houses[${index}].seat`),
        region: expectString(raw.region, `houses[${index}].region`),
        words: raw.words === undefined ? null : expectNullableString(raw.words, `houses[${index}].words`),
        sigil: expectString(raw.sigil, `houses[${index}].sigil`),
        color: expectOptionalString(raw.color, `houses[${index}].color`),
        status,
    }
}

function parsePerson(raw: unknown, index: number): Person {
    if (!isRecord(raw)) {
        throw new Error(`Invalid person at index ${index}`)
    }

    const gender = raw.gender
    if (gender !== 'male' && gender !== 'female') {
        throw new Error(`Invalid gender at persons[${index}]`)
    }

    const status = raw.status
    if (status !== 'alive' && status !== 'deceased' && status !== 'imprisoned' && status !== 'unknown') {
        throw new Error(`Invalid status at persons[${index}]`)
    }

    const titles = raw.titles
    if (titles !== undefined && (!Array.isArray(titles) || titles.some(title => typeof title !== 'string'))) {
        throw new Error(`Invalid titles at persons[${index}]`)
    }
    const parsedTitles = Array.isArray(titles) ? titles : undefined

    return {
        id: expectString(raw.id, `persons[${index}].id`),
        name: expectString(raw.name, `persons[${index}].name`),
        alias: expectOptionalString(raw.alias, `persons[${index}].alias`),
        house: raw.house === undefined || raw.house === null ? null : expectString(raw.house, `persons[${index}].house`),
        marriedInto: expectOptionalString(raw.marriedInto, `persons[${index}].marriedInto`),
        trueHouse: expectOptionalString(raw.trueHouse, `persons[${index}].trueHouse`),
        raisedAs: expectOptionalString(raw.raisedAs, `persons[${index}].raisedAs`),
        gender,
        titles: parsedTitles,
        status,
        deathCause: expectOptionalString(raw.deathCause, `persons[${index}].deathCause`),
        bastard: expectOptionalBoolean(raw.bastard, `persons[${index}].bastard`),
        legitimized: expectOptionalBoolean(raw.legitimized, `persons[${index}].legitimized`),
    }
}

function parseRelationship(raw: unknown, index: number): Relationship {
    if (!isRecord(raw)) {
        throw new Error(`Invalid relationship at index ${index}`)
    }

    const id = expectOptionalString(raw.id, `relationships[${index}].id`)
    const secret = expectOptionalBoolean(raw.secret, `relationships[${index}].secret`)
    const type = raw.type

    if (type === 'parent-child') {
        return {
            id,
            type,
            parent: expectString(raw.parent, `relationships[${index}].parent`),
            child: expectString(raw.child, `relationships[${index}].child`),
            secret,
        }
    }

    if (type === 'spouse' || type === 'betrothed') {
        return {
            id,
            type,
            person1: expectString(raw.person1, `relationships[${index}].person1`),
            person2: expectString(raw.person2, `relationships[${index}].person2`),
            secret,
        }
    }

    throw new Error(`Invalid relationship type at relationships[${index}]`)
}

export function parseFamilyTreeData(raw: unknown): FamilyTreeData {
    if (!isRecord(raw)) {
        throw new Error('Invalid family tree data')
    }

    if (!Array.isArray(raw.houses)) {
        throw new Error('Invalid houses array')
    }
    if (!Array.isArray(raw.persons)) {
        throw new Error('Invalid persons array')
    }
    if (!Array.isArray(raw.relationships)) {
        throw new Error('Invalid relationships array')
    }

    return {
        houses: raw.houses.map((house, index) => parseHouse(house, index)),
        persons: raw.persons.map((person, index) => parsePerson(person, index)),
        relationships: raw.relationships.map((relationship, index) => parseRelationship(relationship, index)),
    }
}
