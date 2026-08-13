import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import StatusBadge from './StatusBadge'
import { formatDate } from '../utils/formatDate'

export default function TicketCard({ ticket }) {
    return (
        <article className="ticket-card">
            <div className="ticket-card-top">
                <div>
                    <p className="ticket-title">{ticket.ticket_id}</p>
                    <p className="ticket-meta">{ticket.customer_name}</p>
                </div>
                <StatusBadge status={ticket.status} />
            </div>

            <div>
                <p className="ticket-title" style={{ fontSize: '1rem' }}>{ticket.subject}</p>
                <p className="ticket-meta">Created {formatDate(ticket.created_at)}</p>
            </div>

            <div className="ticket-card-actions">
                <Link className="btn btn-secondary" to={`/tickets/${ticket.ticket_id}`}>
                    View Ticket
                    <ArrowRight size={16} />
                </Link>
            </div>
        </article>
    )
}


