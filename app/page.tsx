'use client'

import Header from '@/components/layout/Header'
import FamilyTree from '@/components/visualization/FamilyTree'
import CharacterDetail from '@/components/panels/CharacterDetail'
import Legend from '@/components/common/Legend'
import TreeControls from '@/components/common/TreeControls'
import Minimap from '@/components/common/Minimap'
import FilterPanel from '@/components/filters/FilterPanel'

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 flex overflow-hidden">
                <div className="flex-1 relative overflow-hidden">
                    <FamilyTree />
                    <FilterPanel />
                    <TreeControls />
                    <Minimap />
                    <Legend />
                </div>
                <CharacterDetail />
            </main>
        </div>
    )
}
