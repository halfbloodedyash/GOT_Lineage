'use client'

import { PERSON_STATUSES } from '@/lib/constants/status-colors'
import { getStatusColor, getStatusLabel } from '@/lib/utils/status'

export default function Legend() {
    return (
        <div className="absolute bottom-4 left-4 z-dropdown bg-bg-secondary/95 backdrop-blur-sm border border-border rounded-sm shadow-lg p-3 text-xs">
            <h4 className="text-sm font-display uppercase tracking-wider text-accent-primary mb-3 border-none p-0">
                Legend
            </h4>

            {/* Relationships */}
            <div className="mb-3">
                <span className="block text-text-muted uppercase tracking-wider mb-1.5 text-[10px]">
                    Relationships
                </span>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-0.5 bg-line-blood" />
                        <span className="text-text-secondary">Parent-Child</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-0.5 bg-line-marriage" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #8a1c1c 0, #8a1c1c 4px, transparent 4px, transparent 6px)' }} />
                        <span className="text-text-secondary">Marriage</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-0.5 bg-line-betrothed" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #d35400 0, #d35400 2px, transparent 2px, transparent 4px)' }} />
                        <span className="text-text-secondary">Betrothed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-0.5 bg-line-secret opacity-70" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #5a5a5a 0, #5a5a5a 3px, transparent 3px, transparent 5px)' }} />
                        <span className="text-text-secondary">Secret</span>
                    </div>
                </div>
            </div>

            {/* Status */}
            <div className="mb-3">
                <span className="block text-text-muted uppercase tracking-wider mb-1.5 text-[10px]">
                    Status
                </span>
                <div className="space-y-1">
                    {PERSON_STATUSES.map(status => (
                        <div key={status} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor(status) }} />
                            <span className="text-text-secondary">{getStatusLabel(status)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Node Size */}
            <div>
                <span className="block text-text-muted uppercase tracking-wider mb-1.5 text-[10px]">
                    Node Size
                </span>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-border-gold/50 border border-border-gold" />
                        <span className="text-text-secondary">King/Queen</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-border/50 border border-border" />
                        <span className="text-text-secondary">Lord/Lady</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-border/50 border border-border" />
                        <span className="text-text-secondary">Other</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
