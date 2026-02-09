import type { PersonStatus } from '@/lib/constants/status-colors'
import { STATUS_COLORS } from '@/lib/constants/status-colors'

const STATUS_LABELS: Record<PersonStatus, string> = {
    alive: 'Alive',
    deceased: 'Deceased',
    imprisoned: 'Imprisoned',
    unknown: 'Unknown',
}

function withAlpha(color: string, alphaHex: string): string {
    if (/^#[0-9a-fA-F]{6}$/.test(color)) {
        return `${color}${alphaHex}`
    }
    return color
}

export function getStatusColor(status: PersonStatus | undefined): string {
    if (!status) return STATUS_COLORS.unknown
    return STATUS_COLORS[status] || STATUS_COLORS.unknown
}

export function getStatusLabel(status: PersonStatus | undefined): string {
    if (!status) return STATUS_LABELS.unknown
    return STATUS_LABELS[status] || STATUS_LABELS.unknown
}

export function getStatusBadgeStyle(status: PersonStatus | undefined) {
    const color = getStatusColor(status)
    return {
        color,
        backgroundColor: withAlpha(color, '33'),
    }
}
