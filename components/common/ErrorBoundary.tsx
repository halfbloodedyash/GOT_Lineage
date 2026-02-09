'use client'

import React from 'react'

type ErrorBoundaryProps = {
    children: React.ReactNode
    fallback?: React.ReactNode
}

type ErrorBoundaryState = {
    hasError: boolean
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false }

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true }
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('UI error boundary caught:', error, info)
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <div className="p-6 m-6 border border-border rounded-sm bg-surface text-text-secondary">
                        Something went wrong while rendering this section.
                    </div>
                )
            )
        }

        return this.props.children
    }
}
