'use client'

import Header from '@/components/layout/Header'
import FamilyTree from '@/components/visualization/FamilyTree'
import CharacterDetail from '@/components/panels/CharacterDetail'
import Legend from '@/components/common/Legend'
import TreeControls from '@/components/common/TreeControls'
import Minimap from '@/components/common/Minimap'
import FilterPanel from '@/components/filters/FilterPanel'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import AtmosphereBackground from '@/components/common/AtmosphereBackground'
import { TreeProvider } from '@/lib/context/tree-context'
import type { FamilyTreeData } from '@/lib/types'

export default function TreeApp({ initialData }: { initialData?: FamilyTreeData | null }) {
    return (
        <TreeProvider initialData={initialData || undefined}>
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[999] focus:px-4 focus:py-2 focus:bg-bg-secondary focus:border focus:border-border focus:text-text-primary focus:rounded-sm"
            >
                Skip to content
            </a>
            <div className="relative isolate flex flex-col min-h-screen overflow-hidden">
                <AtmosphereBackground />
                <Header />
                <main id="main-content" className="relative z-10 flex-1 flex overflow-hidden">
                    <div className="flex-1 relative overflow-hidden">
                        <ErrorBoundary>
                            <FamilyTree />
                        </ErrorBoundary>
                        <FilterPanel />
                        <TreeControls />
                        <Minimap />
                        <Legend />
                    </div>
                    <ErrorBoundary>
                        <CharacterDetail />
                    </ErrorBoundary>
                </main>
            </div>
        </TreeProvider>
    )
}
