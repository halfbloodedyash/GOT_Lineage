import type { Metadata } from 'next'
import { TreeProvider } from '@/lib/context/tree-context'
import './globals.css'

export const metadata: Metadata = {
    title: 'GoT Lineage Explorer',
    description: 'Explore the family trees and lineages of Westeros - Game of Thrones & House of the Dragon',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <TreeProvider>
                    {children}
                </TreeProvider>
            </body>
        </html>
    )
}
