export const UNCATEGORIZED_ID = 'cat-uncategorized';

export const seedCategories = [
    { id: 'cat-food', name: 'Food', color: '#FF9F43', icon: '🍔' },
    { id: 'cat-transport', name: 'Transport', color: '#1E90FF', icon: '🚌' },
    { id: 'cat-shopping', name: 'Shopping', color: '#E83E8C', icon: '🛍️' },
    { id: 'cat-entertainment', name: 'Entertainment', color: '#6F42C1', icon: '🎮' },
    { id: 'cat-health', name: 'Health', color: '#28A745', icon: '💊' },
    { id: 'cat-bills', name: 'Bills', color: '#FD7E14', icon: '💡' },
    { id: 'cat-travel', name: 'Travel', color: '#20C997', icon: '✈️' },
    { id: 'cat-education', name: 'Education', color: '#FFC107', icon: '📚' },
    { id: 'cat-pets', name: 'Pets', color: '#FF6F61', icon: '🐾' },
    { id: 'cat-gifts', name: 'Gifts', color: '#DC3545', icon: '🎁' },
    { id: 'cat-sport', name: 'Sport', color: '#198754', icon: '⚽' },
    { id: 'cat-tech', name: 'Tech', color: '#6610F2', icon: '💻' },
    { id: 'cat-others', name: 'Other', color: '#6C757D', icon: '📦' },

    {
        id: UNCATEGORIZED_ID,
        name: 'Uncategorized',
        color: '#9E9E9E',
        icon: '❓',
        isSystem: true,
    },
];

