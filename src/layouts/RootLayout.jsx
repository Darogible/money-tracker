import { useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

import { seedCategories } from '../entities/categories/seed'
import { seedTransactions } from '../entities/transactions/seed'

const CATEGORIES_KEY = 'moneyTracker_categories'
const TRANSACTIONS_KEY = 'moneyTracker_transactions'



export default function RootLayout() {
    useEffect(() => {
        const rawCategories = localStorage.getItem(CATEGORIES_KEY)
        if (!rawCategories) {
            localStorage.setItem(
                CATEGORIES_KEY,
                JSON.stringify(seedCategories)
            )
        }

        const rawTransactions = localStorage.getItem(TRANSACTIONS_KEY)
        if (!rawTransactions) {
            localStorage.setItem(
                TRANSACTIONS_KEY,
                JSON.stringify(seedTransactions)
            )
        }
    }, [])

    const linkStyle = ({ isActive }) => ({
        padding: '6px 10px',
        borderRadius: 8,
        textDecoration: 'none',
        background: isActive ? '#eee' : '#f6f6f6',
        color: '#222',
    })

    return (
        <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif' }}>
            {/* Centered app container */}
            <div style={{ maxWidth: 960, margin: '0 auto' }}>
                <nav
                    style={{
                        display: 'flex',
                        gap: 8,
                        marginBottom: 12,
                        justifyContent: 'center',
                    }}
                >
                    <NavLink to="/dashboard" style={linkStyle}>
                        Dashboard
                    </NavLink>
                    <NavLink to="/transactions" style={linkStyle}>
                        Transactions
                    </NavLink>
                    <NavLink to="/settings" style={linkStyle}>
                        Settings
                    </NavLink>
                </nav>

                <Outlet />
            </div>
        </div>
    )
}
