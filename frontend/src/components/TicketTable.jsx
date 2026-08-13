import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import StatusBadge from './StatusBadge'
import TicketCard from './TicketCard'
import { formatDate } from '../utils/formatDate'

export default function TicketTable({ tickets }) {
    return (
        <>
            <div className="table-wrap">
                <table className="tickets-table">
                    <thead>
                        <tr>
                            <th>Ticket ID</th>
                            <th>Customer</th>
                            <th>Subject</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map((ticket) => (
                            <tr key={ticket.ticket_id}>
                                <td>
                                    <p className="ticket-title">{ticket.ticket_id}</p>
                                </td>
                                <td>
                                    <p className="ticket-title">{ticket.customer_name}</p>
                                    <p className="ticket-meta">{ticket.customer_email}</p>
                                </td>
                                <td>
                                    <p className="ticket-title" style={{ fontSize: '1rem' }}>
                                        {ticket.subject}
                                    </p>
                                </td>
                                <td>
                                    <StatusBadge status={ticket.status} />
                                </td>
                                <td>{formatDate(ticket.created_at)}</td>
                                <td>
                                    <Link className="table-action" to={`/tickets/${ticket.ticket_id}`}>
                                        View Ticket <ArrowRight size={14} />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mobile-list">
                {tickets.map((ticket) => (
                    <TicketCard key={ticket.ticket_id} ticket={ticket} />
                ))}
            </div>
        </>
    )
}


