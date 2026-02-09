import fs from 'node:fs/promises'
import path from 'node:path'
import TreeApp from '@/components/TreeApp'
import { normalizeFamilyTreeData } from '@/lib/data-loader'
import { parseFamilyTreeData } from '@/lib/validation/family-tree'
import type { FamilyTreeData } from '@/lib/types'

async function getInitialData(): Promise<FamilyTreeData | null> {
    try {
        const filePath = path.join(process.cwd(), 'public', 'data', 'complete_lineage.json')
        const raw = await fs.readFile(filePath, 'utf8')
        const parsed = parseFamilyTreeData(JSON.parse(raw))
        return normalizeFamilyTreeData(parsed)
    } catch (error) {
        console.error('Failed to load initial data on server:', error)
        return null
    }
}

export default async function Home() {
    const data = await getInitialData()
    return <TreeApp initialData={data} />
}
