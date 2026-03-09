import React, { createContext, useContext, useState, useCallback } from 'react';

interface Toast {
    id: string;
    title: string;
    description?: string;
    variant?: 'default' | 'destructive';
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    toast: (toast: Omit<Toast, 'id'>) => void;
    dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback((newToast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 11);
        const duration = newToast.duration ?? 5000;
        setToasts((prev) => [...prev, { ...newToast, id }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    }, []);

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, toast, dismiss }}>
            {children}
            <ToastContainer toasts={toasts} dismiss={dismiss} />
        </ToastContext.Provider>
    );
}

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`animate-in fade-in slide-in-from-bottom-2 rounded-lg border px-4 py-3 shadow-lg ${
                        t.variant === 'destructive'
                            ? 'border-destructive bg-destructive text-destructive-foreground'
                            : 'border-border bg-card text-foreground'
                    }`}
                    onClick={() => dismiss(t.id)}
                >
                    <div className="font-medium text-sm">{t.title}</div>
                    {t.description && (
                        <div className="text-xs opacity-90 mt-0.5">{t.description}</div>
                    )}
                </div>
            ))}
        </div>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        return {
            toast: () => {},
            toasts: [],
            dismiss: () => {},
        };
    }
    return context;
}

export const toast = (props: Omit<Toast, 'id'>) => {
    console.log('Toast:', props);
};