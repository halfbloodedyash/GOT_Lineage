import type { Person } from '@/lib/types'

export type PersonStatus = Person['status']

export const STATUS_COLORS: Record<PersonStatus, string> = {
    alive: '#27ae60',
    deceased: '#7f8c8d',
    imprisoned: '#d35400',
    unknown: '#8e44ad',
}

export const PERSON_STATUSES: PersonStatus[] = ['alive', 'deceased', 'imprisoned', 'unknown']
