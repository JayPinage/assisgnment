import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import CreateTicket from './pages/CreateTicket'
import Dashboard from './pages/Dashboard'
import TicketDetails from './pages/TicketDetails'

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tickets/new" element={<CreateTicket />} />
                <Route path="/tickets/:ticketId" element={<TicketDetails />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

