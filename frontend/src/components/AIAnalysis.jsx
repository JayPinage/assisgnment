import { useEffect, useState } from 'react'
import { Bot, CheckCheck, Copy, LoaderCircle, Sparkles } from 'lucide-react'

import { analyzeTicket } from '../services/api'
import Toast from './Toast'

export default function AIAnalysis({ ticketId }) {
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [analysis, setAnalysis] = useState(null)
    const [copyFeedback, setCopyFeedback] = useState('')
    const [toast, setToast] = useState({ message: '', variant: 'info' })

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

    async function handleAnalyze() {
        setLoading(true)
        setErrorMessage('')
        setCopyFeedback('')

        try {
            const result = await analyzeTicket(ticketId)
            setAnalysis(result)
            showToast('AI analysis completed.', 'success')
        } catch (requestError) {
            setErrorMessage('AI analysis is temporarily unavailable. Please try again.')
            showToast('AI analysis could not be completed.', 'error')
        } finally {
            setLoading(false)
        }
    }

    async function handleCopyResponse() {
        if (!analysis?.suggested_response) {
            return
        }

        try {
            await navigator.clipboard.writeText(analysis.suggested_response)
            setCopyFeedback('Response copied to clipboard.')
            showToast('Suggested response copied.', 'success')
        } catch (requestError) {
            setCopyFeedback('Could not copy the response.')
            showToast('Copy action failed.', 'error')
        }
    }

    return (
        <section className="section-card ai-panel">
            <div className="details-header">
                <div>
                    <p className="eyebrow" style={{ marginBottom: 6 }}>
                        AI Ticket Assistant
                    </p>
                    <h2 className="details-title">Analyze the ticket with AI</h2>
                    <p className="subtle-copy" style={{ marginTop: 8 }}>
                        Generate a concise summary, sentiment, priority, and a customer-facing
                        reply suggestion.
                    </p>
                </div>

                <button
                    className="btn btn-primary"
                    type="button"
                    onClick={handleAnalyze}
                    disabled={loading}
                >
                    {loading ? <LoaderCircle className="spin-icon" size={18} /> : <Sparkles size={18} />}
                    {loading ? 'Analyzing...' : 'Analyze with AI'}
                </button>
            </div>

            <Toast message={toast.message} variant={toast.variant} />

            {errorMessage ? (
                <div className="inline-alert inline-alert-error" style={{ marginBottom: 16 }}>
                    <Bot size={18} />
                    <span>{errorMessage}</span>
                </div>
            ) : null}

            {analysis ? (
                <div className="ai-results">
                    <article className="ai-result-card">
                        <p className="ai-label">Summary</p>
                        <p className="ai-copy">{analysis.summary}</p>
                    </article>

                    <div className="ai-metrics">
                        <div className="ai-pill">
                            <span className="ai-label">Sentiment</span>
                            <strong>{analysis.sentiment}</strong>
                        </div>
                        <div className="ai-pill">
                            <span className="ai-label">Priority</span>
                            <strong>{analysis.priority}</strong>
                        </div>
                    </div>

                    <article className="ai-result-card">
                        <p className="ai-label">Suggested Response</p>
                        <p className="ai-copy">{analysis.suggested_response}</p>
                        <div className="hero-actions" style={{ marginTop: 16 }}>
                            <button className="btn btn-secondary" type="button" onClick={handleCopyResponse}>
                                {copyFeedback ? <CheckCheck size={18} /> : <Copy size={18} />}
                                {copyFeedback || 'Copy Response'}
                            </button>
                        </div>
                    </article>
                </div>
            ) : (
                <div className="empty-ai">
                    Click Analyze with AI to generate ticket insights and a suggested response.
                </div>
            )}
        </section>
    )
}

