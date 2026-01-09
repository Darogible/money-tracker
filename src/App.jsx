import { Routes, Route, Navigate } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import Transactions from './pages/Transactions/Transactions.jsx'
import Settings from './pages/Settings/Settings.jsx'



function NotFound() {
    return <div style={{ padding: 8 }}>Not found</div>
}

export default function App() {
    return (
        <Routes>
            <Route element={<RootLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/settings" element={<Settings />} />

                {/* 404 (fallback route) */}
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    )
}
