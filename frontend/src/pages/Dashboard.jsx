import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

import TicketTable from '../components/TicketTable'
import { getTickets } from '../services/api'

const STATUS_OPTIONS = ['All', 'Open', 'In Progress', 'Closed']

function StatCard({ label, value }) {
    return (
        <article className="stat-card">
            <p className="stat-label">{label}</p>
            <p className="stat-value">{value}</p>
        </article>
    )
}

export default function Dashboard() {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('All')

    useEffect(() => {
        let isActive = true

        async function loadTickets() {
            setLoading(true)
            setError('')

            try {
                const data = await getTickets()
                if (isActive) {
                    setTickets(data)
                }
            } catch (requestError) {
                if (isActive) {
                    setError('Unable to load tickets right now.')
                }
            } finally {
                if (isActive) {
                    setLoading(false)
                }
            }
        }

        loadTickets()

        return () => {
            isActive = false
        }
    }, [])

    const filteredTickets = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase()

        return tickets.filter((ticket) => {
            const matchesStatus =
                statusFilter === 'All' ? true : ticket.status === statusFilter

            const searchableText = [
                ticket.ticket_id,
                ticket.customer_name,
                ticket.customer_email,
                ticket.subject,
                ticket.description,
            ]
                .join(' ')
                .toLowerCase()

            const matchesSearch = normalizedSearch
                ? searchableText.includes(normalizedSearch)
                : true

            return matchesStatus && matchesSearch
        })
    }, [searchTerm, statusFilter, tickets])

    const stats = useMemo(() => {
        return {
            total: tickets.length,
            open: tickets.filter((ticket) => ticket.status === 'Open').length,
            inProgress: tickets.filter((ticket) => ticket.status === 'In Progress').length,
            closed: tickets.filter((ticket) => ticket.status === 'Closed').length,
        }
    }, [tickets])

    return (
        <main className="dashboard-shell">
            <section className="hero">
                <div className="hero-top">
                    <div>
                        <p className="eyebrow">Support CRM Dashboard</p>
                        <h1>Track every customer ticket in one place.</h1>
                        <p>
                            Monitor support volume, search requests as you type, and quickly
                            jump into any ticket record.
                        </p>
                    </div>

                    <div className="hero-actions">
                        <Link className="btn btn-primary" to="/tickets/new">
                            <Plus size={18} />
                            Create Ticket
                        </Link>
                    </div>
                </div>

                <div className="stats-grid">
                    <StatCard label="Total Tickets" value={stats.total} />
                    <StatCard label="Open Tickets" value={stats.open} />
                    <StatCard label="In Progress Tickets" value={stats.inProgress} />
                    <StatCard label="Closed Tickets" value={stats.closed} />
                </div>
            </section>

            <div className="controls-row">
                <label>
                    <span className="sr-only">Search tickets</span>
                    <input
                        className="input"
                        type="search"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search by ticket ID, customer, email, subject, or description"
                    />
                </label>

                <label>
                    <span className="sr-only">Filter by status</span>
                    <select
                        className="select"
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                    >
                        {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <section className="section-card">
                {loading ? (
                    <div className="state-panel">
                        <div className="spinner" aria-hidden="true" />
                        <p className="state-title" style={{ marginTop: '14px' }}>
                            Loading tickets...
                        </p>
                    </div>
                ) : error ? (
                    <div className="state-panel">
                        <AlertTriangle size={32} color="#dc2626" />
                        <h2 className="state-title" style={{ marginTop: '12px' }}>
                            Something went wrong
                        </h2>
                        <p className="state-copy error-text">{error}</p>
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <div className="state-panel">
                        <h2 className="state-title">No tickets found</h2>
                        <p className="state-copy">
                            Try a different search term, adjust the filter, or create a new
                            support ticket.
                        </p>
                        <div className="hero-actions" style={{ justifyContent: 'center', marginTop: '18px' }}>
                            <Link className="btn btn-primary" to="/tickets/new">
                                <Plus size={18} />
                                Create Ticket
                            </Link>
                        </div>
                    </div>
                ) : (
                    <TicketTable tickets={filteredTickets} />
                )}
            </section>
        </main>
    )
}


