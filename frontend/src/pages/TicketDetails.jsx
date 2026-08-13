import { useEffect, useMemo, useState } from 'react'
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    LoaderCircle,
    Save,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import StatusBadge from '../components/StatusBadge'
import AIAnalysis from '../components/AIAnalysis'
import Toast from '../components/Toast'
import { getTicket, updateTicket } from '../services/api'

const STATUS_OPTIONS = ['Open', 'In Progress', 'Closed']

export default function TicketDetails() {
    const { ticketId } = useParams()
    const [ticket, setTicket] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [status, setStatus] = useState('Open')
    const [noteText, setNoteText] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [toast, setToast] = useState({ message: '', variant: 'info' })

    useEffect(() => {
        let isActive = true

        async function loadTicket() {
            setLoading(true)
            setErrorMessage('')
            setSuccessMessage('')

            try {
                const data = await getTicket(ticketId)

                if (isActive) {
                    setTicket(data)
                    setStatus(data.status)
                    setNoteText('')
                }
            } catch (requestError) {
                if (isActive) {
                    setErrorMessage('Unable to load this ticket right now.')
                }
            } finally {
                if (isActive) {
                    setLoading(false)
                }
            }
        }

        loadTicket()

        return () => {
            isActive = false
        }
    }, [ticketId])

    const hasChanges = useMemo(() => {
        if (!ticket) {
            return false
        }

        return status !== ticket.status || noteText.trim().length > 0
    }, [noteText, status, ticket])

    useEffect(() => {
        if (!toast.message) {
            return undefined
        }

        const timeoutId = window.setTimeout(() => {
            setToast({ message: '', variant: 'info' })
        }, 2600)

        return () => window.clearTimeout(timeoutId)
    }, [toast.message])

    function showToast(message, variant = 'info') {
        setToast({ message, variant })
    }

    async function handleSave(event) {
        event.preventDefault()

        if (!noteText.trim() && status === ticket.status) {
            setErrorMessage('Change the status or add a note before saving.')
            return
        }

        setSaving(true)
        setErrorMessage('')
        setSuccessMessage('')

        try {
            const updatedTicket = await updateTicket(ticketId, {
                status,
                notes: noteText.trim() || 'Status updated.',
            })

            const refreshedTicket = await getTicket(ticketId)
            setTicket(refreshedTicket)
            setStatus(refreshedTicket.status)
            setNoteText('')
            setSuccessMessage('Ticket updated successfully.')
            showToast('Ticket saved successfully.', 'success')
            return updatedTicket
        } catch (requestError) {
            setErrorMessage('Unable to save changes right now.')
            showToast('Could not save ticket changes.', 'error')
            return null
        } finally {
            setSaving(false)
        }
    }

    return (
        <main className="dashboard-shell">
            <section className="hero">
                <div className="hero-top">
                    <div>
                        <p className="eyebrow">Ticket Details</p>
                        <h1 className="page-title">{ticketId}</h1>
                        <p className="subtle-copy">
                            Review the full ticket, update the current status, and add internal
                            notes before saving.
                        </p>
                    </div>

                    <div className="hero-actions">
                        <Link className="btn btn-secondary" to="/dashboard">
                            <ArrowLeft size={18} />
                            Back to Dashboard
                        </Link>
                    </div>
                </div>

                <Toast message={toast.message} variant={toast.variant} />

                {loading ? (
                    <div className="state-panel section-card" style={{ boxShadow: 'none' }}>
                        <div className="spinner" aria-hidden="true" />
                        <p className="state-title" style={{ marginTop: '14px' }}>
                            Loading ticket details...
                        </p>
                    </div>
                ) : errorMessage ? (
                    <div className="state-panel section-card" style={{ boxShadow: 'none' }}>
                        <AlertTriangle size={32} color="#dc2626" />
                        <h2 className="state-title" style={{ marginTop: '12px' }}>
                            We could not load this ticket
                        </h2>
                        <p className="state-copy error-text">{errorMessage}</p>
                    </div>
                ) : ticket ? (
                    <>
                        <div className="details-grid">
                            <section className="section-card details-panel">
                                <div className="details-header">
                                    <div>
                                        <p className="eyebrow" style={{ marginBottom: 6 }}>
                                            Customer Request
                                        </p>
                                        <h2 className="details-title">{ticket.subject}</h2>
                                        <p className="ticket-meta">
                                            Created {new Date(ticket.created_at).toLocaleString()}
                                        </p>
                                    </div>

                                    <StatusBadge status={ticket.status} />
                                </div>

                                <div className="details-stack">
                                    <div className="details-row">
                                        <span>Ticket ID</span>
                                        <strong>{ticket.ticket_id}</strong>
                                    </div>
                                    <div className="details-row">
                                        <span>Customer Name</span>
                                        <strong>{ticket.customer_name}</strong>
                                    </div>
                                    <div className="details-row">
                                        <span>Customer Email</span>
                                        <strong>{ticket.customer_email}</strong>
                                    </div>
                                    <div className="details-row details-description">
                                        <span>Description</span>
                                        <p>{ticket.description}</p>
                                    </div>
                                    <div className="details-row">
                                        <span>Updated At</span>
                                        <strong>{new Date(ticket.updated_at).toLocaleString()}</strong>
                                    </div>
                                </div>
                            </section>

                            <section className="section-card details-panel">
                                <div className="details-header">
                                    <div>
                                        <p className="eyebrow" style={{ marginBottom: 6 }}>
                                            Support Actions
                                        </p>
                                        <h2 className="details-title">Update status and notes</h2>
                                    </div>
                                </div>

                                <form className="ticket-form" onSubmit={handleSave}>
                                    <label className="field">
                                        <span>Status</span>
                                        <select
                                            className="select"
                                            value={status}
                                            onChange={(event) => setStatus(event.target.value)}
                                        >
                                            {STATUS_OPTIONS.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="field">
                                        <span>Add Note</span>
                                        <textarea
                                            className="input textarea"
                                            rows="6"
                                            value={noteText}
                                            onChange={(event) => setNoteText(event.target.value)}
                                            placeholder="Add an internal note or context about the ticket update."
                                        />
                                    </label>

                                    {errorMessage ? (
                                        <div className="inline-alert inline-alert-error">
                                            <AlertTriangle size={18} />
                                            <span>{errorMessage}</span>
                                        </div>
                                    ) : null}

                                    {successMessage ? (
                                        <div className="inline-alert inline-alert-success">
                                            <CheckCircle2 size={18} />
                                            <span>{successMessage}</span>
                                        </div>
                                    ) : null}

                                    <div className="form-actions">
                                        <p className="form-hint">
                                            Save changes to update the ticket and append a new note.
                                        </p>

                                        <button
                                            className="btn btn-primary"
                                            type="submit"
                                            disabled={saving || !hasChanges}
                                        >
                                            {saving ? (
                                                <LoaderCircle className="spin-icon" size={18} />
                                            ) : (
                                                <Save size={18} />
                                            )}
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>

                                <section style={{ marginTop: 24 }}>
                                    <p className="eyebrow" style={{ marginBottom: 12 }}>
                                        Notes
                                    </p>

                                    {ticket.notes.length === 0 ? (
                                        <div className="empty-notes">
                                            No notes have been added to this ticket yet.
                                        </div>
                                    ) : (
                                        <div className="notes-list">
                                            {ticket.notes.map((note) => (
                                                <article className="note-item" key={note.id}>
                                                    <p className="note-text">{note.note_text}</p>
                                                    <p className="note-meta">
                                                        {new Date(note.created_at).toLocaleString()}
                                                    </p>
                                                </article>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            </section>
                        </div>

                        <div style={{ marginTop: 18 }}>
                            <AIAnalysis ticketId={ticket.ticket_id} />
                        </div>
                    </>
                ) : null}
            </section>
        </main>
    )
}

