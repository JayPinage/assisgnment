import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowLeft, CheckCircle2, LoaderCircle, Plus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import Toast from '../components/Toast'
import { createTicket } from '../services/api'

const INITIAL_FORM_STATE = {
    customerName: '',
    customerEmail: '',
    subject: '',
    description: '',
}

export default function CreateTicket() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState(INITIAL_FORM_STATE)
    const [fieldErrors, setFieldErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [successTicketId, setSuccessTicketId] = useState('')
    const [createdAt, setCreatedAt] = useState('')
    const [toast, setToast] = useState({ message: '', variant: 'info' })

    const hasSubmittedSuccess = Boolean(successTicketId)

    useEffect(() => {
        if (!successTicketId) {
            return undefined
        }

        const redirectTimer = window.setTimeout(() => {
            navigate(`/tickets/${successTicketId}`)
        }, 1400)

        return () => window.clearTimeout(redirectTimer)
    }, [navigate, successTicketId])

    const isSubmitDisabled = useMemo(() => {
        return loading || hasSubmittedSuccess
    }, [hasSubmittedSuccess, loading])

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

    function handleChange(event) {
        const { name, value } = event.target

        setFormData((current) => ({
            ...current,
            [name]: value,
        }))

        if (fieldErrors[name]) {
            setFieldErrors((current) => ({
                ...current,
                [name]: '',
            }))
        }
    }

    function validateForm() {
        const nextErrors = {}

        if (!formData.customerName.trim()) {
            nextErrors.customerName = 'Customer name is required.'
        }

        if (!formData.customerEmail.trim()) {
            nextErrors.customerEmail = 'Customer email is required.'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail.trim())) {
            nextErrors.customerEmail = 'Enter a valid email address.'
        }

        if (!formData.subject.trim()) {
            nextErrors.subject = 'Issue title is required.'
        }

        if (!formData.description.trim()) {
            nextErrors.description = 'Issue description is required.'
        }

        return nextErrors
    }

    async function handleSubmit(event) {
        event.preventDefault()

        const nextErrors = validateForm()
        setFieldErrors(nextErrors)

        if (Object.keys(nextErrors).length > 0) {
            return
        }

        setLoading(true)
        setErrorMessage('')

        try {
            const response = await createTicket({
                customer_name: formData.customerName.trim(),
                customer_email: formData.customerEmail.trim(),
                subject: formData.subject.trim(),
                description: formData.description.trim(),
            })

            setSuccessTicketId(response.ticket_id)
            setCreatedAt(response.created_at)
            showToast(`Ticket ${response.ticket_id} created successfully.`, 'success')
        } catch (requestError) {
            setErrorMessage('Unable to create the ticket right now. Please try again.')
            showToast('Ticket creation failed.', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="dashboard-shell">
            <section className="hero">
                <div className="hero-top">
                    <div>
                        <p className="eyebrow">New Support Ticket</p>
                        <h1 className="page-title">Capture the issue and assign a ticket ID.</h1>
                        <p className="subtle-copy">
                            Keep the intake form simple, validate early, and route the created
                            ticket straight into the CRM flow.
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

                {hasSubmittedSuccess ? (
                    <div className="success-banner">
                        <CheckCircle2 size={18} />
                        <div>
                            <p className="success-title">Ticket created successfully</p>
                            <p className="success-copy">
                                Ticket ID <strong>{successTicketId}</strong> was created at{' '}
                                {createdAt ? new Date(createdAt).toLocaleString() : 'now'}.
                                You will be redirected to the ticket details page shortly.
                            </p>
                        </div>
                    </div>
                ) : null}

                <section className="section-card form-card">
                    <form className="ticket-form" onSubmit={handleSubmit} noValidate>
                        <div className="form-grid">
                            <label className="field">
                                <span>Customer Name</span>
                                <input
                                    className="input"
                                    name="customerName"
                                    value={formData.customerName}
                                    onChange={handleChange}
                                    placeholder="e.g. John Carter"
                                    autoComplete="name"
                                />
                                {fieldErrors.customerName ? (
                                    <p className="field-error">{fieldErrors.customerName}</p>
                                ) : null}
                            </label>

                            <label className="field">
                                <span>Customer Email</span>
                                <input
                                    className="input"
                                    type="email"
                                    name="customerEmail"
                                    value={formData.customerEmail}
                                    onChange={handleChange}
                                    placeholder="e.g. john@company.com"
                                    autoComplete="email"
                                />
                                {fieldErrors.customerEmail ? (
                                    <p className="field-error">{fieldErrors.customerEmail}</p>
                                ) : null}
                            </label>

                            <label className="field field-full">
                                <span>Issue Title</span>
                                <input
                                    className="input"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="e.g. Payment failed on checkout"
                                />
                                {fieldErrors.subject ? (
                                    <p className="field-error">{fieldErrors.subject}</p>
                                ) : null}
                            </label>

                            <label className="field field-full">
                                <span>Issue Description</span>
                                <textarea
                                    className="input textarea"
                                    name="description"
                                    rows="7"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe the customer's issue, what happened, and any relevant context."
                                />
                                {fieldErrors.description ? (
                                    <p className="field-error">{fieldErrors.description}</p>
                                ) : null}
                            </label>
                        </div>

                        {errorMessage ? (
                            <div className="inline-alert inline-alert-error">
                                <AlertTriangle size={18} />
                                <span>{errorMessage}</span>
                            </div>
                        ) : null}

                        <div className="form-actions">
                            <p className="form-hint">
                                Required fields are validated before the request is sent.
                            </p>

                            <button className="btn btn-primary" type="submit" disabled={isSubmitDisabled}>
                                {loading ? <LoaderCircle className="spin-icon" size={18} /> : <Plus size={18} />}
                                {loading ? 'Creating Ticket...' : 'Create Ticket'}
                            </button>
                        </div>
                    </form>
                </section>
            </section>
        </main>
    )
}

