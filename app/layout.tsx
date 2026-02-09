import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'GoT Lineage Explorer',
    description: 'Explore the family trees and lineages of Westeros - Game of Thrones & House of the Dragon',
    openGraph: {
        title: 'GoT Lineage Explorer',
        description: 'Explore the family trees and lineages of Westeros - Game of Thrones & House of the Dragon',
        type: 'website',
        images: [
            {
                url: '/og.svg',
                width: 1200,
                height: 630,
                alt: 'GoT Lineage Explorer',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'GoT Lineage Explorer',
        description: 'Explore the family trees and lineages of Westeros - Game of Thrones & House of the Dragon',
        images: ['/og.svg'],
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    )
}
