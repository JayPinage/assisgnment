import axios from 'axios'

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
})

export default apiClient

export async function getTickets() {
    const response = await apiClient.get('/api/tickets')
    return response.data
}

export async function createTicket(ticketPayload) {
    const response = await apiClient.post('/api/tickets', ticketPayload)
    return response.data
}

export async function getTicket(ticketId) {
    const response = await apiClient.get(`/api/tickets/${ticketId}`)
    return response.data
}

export async function updateTicket(ticketId, updatePayload) {
    const response = await apiClient.put(`/api/tickets/${ticketId}`, updatePayload)
    return response.data
}

export async function analyzeTicket(ticketId) {
    const response = await apiClient.post(`/api/tickets/${ticketId}/ai-analysis`)
    return response.data
}


