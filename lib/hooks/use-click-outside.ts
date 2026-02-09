import { RefObject, useEffect } from 'react'

export function useClickOutside<T extends HTMLElement>(
    ref: RefObject<T>,
    onOutsideClick: () => void,
    enabled: boolean = true
) {
    useEffect(() => {
        if (!enabled) return

        const handlePointerDown = (event: MouseEvent | TouchEvent) => {
            const node = ref.current
            if (!node) return
            if (node.contains(event.target as Node)) return
            onOutsideClick()
        }

        document.addEventListener('mousedown', handlePointerDown)
        document.addEventListener('touchstart', handlePointerDown)

        return () => {
            document.removeEventListener('mousedown', handlePointerDown)
            document.removeEventListener('touchstart', handlePointerDown)
        }
    }, [enabled, onOutsideClick, ref])
}
