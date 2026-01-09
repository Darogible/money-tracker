import { UNCATEGORIZED_ID } from '../categories/seed';

export const seedTransactions = [
    // FOOD
    { id: 'tx-44', date: '2026-01-29', amount: 75, categoryId: 'cat-food', note: 'Espresso' },
    { id: 'tx-45', date: '2026-01-30', amount: 260, categoryId: 'cat-food', note: 'Dinner' },
    { id: 'tx-46', date: '2026-02-01', amount: 520, categoryId: 'cat-food', note: 'Supermarket' },
    { id: 'tx-47', date: '2026-02-02', amount: 140, categoryId: 'cat-food', note: 'Bakery' },

    // TRANSPORT
    { id: 'tx-48', date: '2026-01-29', amount: 32, categoryId: 'cat-transport', note: 'Bus ticket' },
    { id: 'tx-49', date: '2026-02-01', amount: 210, categoryId: 'cat-transport', note: 'Uber' },
    { id: 'tx-50', date: '2026-02-03', amount: 420, categoryId: 'cat-transport', note: 'Transport card' },

    // SHOPPING
    { id: 'tx-51', date: '2026-01-30', amount: 399, categoryId: 'cat-shopping', note: 'Jeans' },
    { id: 'tx-52', date: '2026-02-02', amount: 89, categoryId: 'cat-shopping', note: 'Socks' },
    { id: 'tx-53', date: '2026-02-04', amount: 1599, categoryId: 'cat-shopping', note: 'Winter coat' },

    // ENTERTAINMENT
    { id: 'tx-54', date: '2026-01-31', amount: 150, categoryId: 'cat-entertainment', note: 'Bowling' },
    { id: 'tx-55', date: '2026-02-02', amount: 99, categoryId: 'cat-entertainment', note: 'Music app' },
    { id: 'tx-56', date: '2026-02-05', amount: 260, categoryId: 'cat-entertainment', note: 'Concert ticket' },

    // HEALTH
    { id: 'tx-57', date: '2026-01-30', amount: 320, categoryId: 'cat-health', note: 'Dentist' },
    { id: 'tx-58', date: '2026-02-03', amount: 110, categoryId: 'cat-health', note: 'Supplements' },
    { id: 'tx-59', date: '2026-02-06', amount: 280, categoryId: 'cat-health', note: 'Pharmacy' },

    // BILLS
    { id: 'tx-60', date: '2026-02-01', amount: 1350, categoryId: 'cat-bills', note: 'Electricity' },
    { id: 'tx-61', date: '2026-02-02', amount: 700, categoryId: 'cat-bills', note: 'Gas' },
    { id: 'tx-62', date: '2026-02-05', amount: 990, categoryId: 'cat-bills', note: 'Phone bill' },

    // TRAVEL
    { id: 'tx-63', date: '2026-02-03', amount: 850, categoryId: 'cat-travel', note: 'Train' },
    { id: 'tx-64', date: '2026-02-06', amount: 4200, categoryId: 'cat-travel', note: 'Vacation booking' },

    // EDUCATION
    { id: 'tx-65', date: '2026-02-01', amount: 300, categoryId: 'cat-education', note: 'Exam fee' },
    { id: 'tx-66', date: '2026-02-04', amount: 199, categoryId: 'cat-education', note: 'Udemy course' },
    { id: 'tx-67', date: '2026-02-07', amount: 90, categoryId: 'cat-education', note: 'Print materials' },

    // PETS
    { id: 'tx-68', date: '2026-02-02', amount: 260, categoryId: 'cat-pets', note: 'Vet food' },
    { id: 'tx-69', date: '2026-02-06', amount: 180, categoryId: 'cat-pets', note: 'Cat snacks' },

    // GIFTS
    { id: 'tx-70', date: '2026-02-04', amount: 800, categoryId: 'cat-gifts', note: 'Anniversary gift' },
    { id: 'tx-71', date: '2026-02-08', amount: 120, categoryId: 'cat-gifts', note: 'Chocolate' },

    // TECH
    { id: 'tx-72', date: '2026-02-02', amount: 249, categoryId: 'cat-tech', note: 'Domain renewal' },
    { id: 'tx-73', date: '2026-02-05', amount: 1299, categoryId: 'cat-tech', note: 'Monitor' },
    { id: 'tx-74', date: '2026-02-08', amount: 199, categoryId: 'cat-tech', note: 'API subscription' },

    // UNCATEGORIZED
    { id: 'tx-75', date: '2026-02-03', amount: 60, categoryId: UNCATEGORIZED_ID, note: 'Cash' },
    { id: 'tx-76', date: '2026-02-07', amount: 145, categoryId: UNCATEGORIZED_ID, note: 'Misc expense' },

];

