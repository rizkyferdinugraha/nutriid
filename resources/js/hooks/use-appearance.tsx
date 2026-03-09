// Simplified appearance hook - Light mode only
export function useAppearance() {
    return {
        appearance: 'light' as const,
        resolvedAppearance: 'light' as const,
        updateAppearance: () => {
            // No-op - light mode only
        },
    } as const;
}

export function initializeTheme(): void {
    if (typeof document === 'undefined') return;

    // Always use light mode
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
}