const STATUS_CLASS_MAP = {
    Open: 'badge-open',
    'In Progress': 'badge-progress',
    Closed: 'badge-closed',
}

export default function StatusBadge({ status }) {
    const className = STATUS_CLASS_MAP[status] ?? 'badge-open'

    return <span className={`badge ${className}`}>{status}</span>
}


