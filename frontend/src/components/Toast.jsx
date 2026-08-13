import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'

const ICON_MAP = {
    success: CheckCircle2,
    error: AlertTriangle,
    info: Info,
}

export default function Toast({ message, variant = 'info' }) {
    if (!message) {
        return null
    }

    const Icon = ICON_MAP[variant] || Info

    return (
        <div className={`toast toast-${variant}`} role="status" aria-live="polite">
            <Icon size={18} />
            <span>{message}</span>
        </div>
    )
}
