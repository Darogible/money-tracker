import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { seedCategories, UNCATEGORIZED_ID } from '../../entities/categories/seed';
import AddTransactionForm from './AddTransactionForm';
import styles from './Transactions.module.css';


const CATEGORIES_KEY = 'moneyTracker_categories';
const TRANSACTIONS_KEY = 'moneyTracker_transactions';

function todayStr() {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
}

export default function Transactions() {
    const navigate = useNavigate();

    // 1) categories (read-only here)
    const [categories] = useState(() => {
        try {
            const raw = localStorage.getItem(CATEGORIES_KEY);
            if (!raw) return seedCategories;
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : seedCategories;
        } catch {
            return seedCategories;
        }
    });

    // quick access to the category by id for list rendering
    const categoriesById = new Map(categories.map(c => [c.id, c]));

    // 2) transactions
    const [transactions, setTransactions] = useState(() => {
        try {
            const raw = localStorage.getItem(TRANSACTIONS_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    });

    const [editTxId, setEditTxId] = useState(null);
    const [editTxForm, setEditTxForm] = useState({
        date: '',
        amount: '',
        categoryId: '',
    });

    const editingTx = editTxId
        ? transactions.find((t) => t.id === editTxId) ?? null
        : null;

    function toNumberOrNull(v) {
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
    }


    const originalTx = editingTx
        ? {
            date: editingTx.date ?? '',
            amount: toNumberOrNull(editingTx.amount),
            categoryId: editingTx.categoryId ?? UNCATEGORIZED_ID,
        }
        : null;


    const isDirty =
        !!originalTx &&
        (
            editTxForm.date !== originalTx.date ||
            toNumberOrNull(editTxForm.amount) !== originalTx.amount ||
            editTxForm.categoryId !== originalTx.categoryId
        );





    function openEditModal(id) {
        setEditTxId(id);
    }

    function closeEditModal() {
        setEditTxId(null);
    }

    function handleSaveEditTransaction() {
        if (!editTxId) return;

        const nextDate = (editTxForm.date || '').trim();
        const nextAmount = Number(editTxForm.amount);
        const nextCategoryId = editTxForm.categoryId || UNCATEGORIZED_ID;

        // simple validation
        if (!nextDate) return;
        if (!Number.isFinite(nextAmount) || nextAmount < 0) return;

        const updated = transactions.map((tx) => {
            if (tx.id !== editTxId) return tx;
            return {
                ...tx,
                date: nextDate,
                amount: nextAmount,
                categoryId: nextCategoryId,
            };
        });

        setTransactions(updated);
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updated));

        closeEditModal();
    }


    useEffect(() => {
        if (!editTxId || !editingTx) return;

        setEditTxForm({
            date: (editingTx.date ?? ''),
            amount: String(editingTx.amount ?? ''),
            categoryId: editingTx.categoryId ?? UNCATEGORIZED_ID,
        });
    }, [editTxId, editingTx]);



    useEffect(() => {
        try {
            localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
        } catch (e) {
            console.warn('Error saving transactions:', e);
        }
    }, [transactions]);

    // read ?categoryId=... from the URL (for auto-completion in the form)
    const [params] = useSearchParams();
    const initialCategoryId = params.get('categoryId') || '';

    function handleAdd(data /* {amount, categoryId, date, note?} */) {
        const id = 'tx-' + (crypto?.randomUUID?.() || Date.now());
        const tx = { id, ...data };
        setTransactions(prev => [tx, ...prev]);

        // after a successful addition, we clear the query so that the form is "clean"
        if (initialCategoryId) {
            navigate('/transactions', { replace: true });
        }
    }

    function handleDelete(id) {
        const ok = window.confirm('Delete this transaction?');
        if (!ok) return;
        setTransactions(prev => prev.filter(x => x.id !== id));
    }

    // sort for display (date descending)
    const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

    // Enter = Save / Esc = Cancel
    useEffect(() => {
        if (!editTxId) return;

        function onKeyDown(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeEditModal();
                return;
            }

            if (e.key === 'Enter') {
                // so that Enter doesn't do anything "weird" in forms
                e.preventDefault();

                if (isDirty) {
                    handleSaveEditTransaction();
                }
            }
        }

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [editTxId, isDirty, editTxForm, editTxId]);


    return (
        <div className={styles.page}>
            <h2 className={styles.titleRow}>
                <span>Transactions</span>
                <small className={styles.meta}>
                    categories: {categories.length} · transactions: {transactions.length}
                </small>
            </h2>

            {/* FORM */}
            <div className={styles.card}>
                <div className={styles.cardTitle}>Add transaction</div>
                <AddTransactionForm
                    categories={categories}
                    initialCategoryId={initialCategoryId}
                    onAdd={handleAdd}
                />
            </div>

            {/* LIST */}
            <div className={styles.card}>
                <div className={styles.cardTitle}>Transactions list</div>

                {sorted.length === 0 ? (
                    <div style={{color: '#666'}}>No transactions yet</div>
                ) : (
                    <ul className={styles.list}>
                        {sorted.map(tx => {
                            const cat = categoriesById.get(tx.categoryId);
                            return (
                                <li key={tx.id} className={styles.row}>
                                    <div className={styles.date}>{tx.date}</div>

                                    <div className={styles.category}>
                                        <div
                                            className={styles.icon}
                                            style={{background: cat?.color || '#ddd'}}
                                        >
                                            {cat?.icon || '❓'}
                                        </div>

                                        <div className={styles.catText}>
                                            <div className={styles.catName}>{cat?.name ?? 'Uncategorized'}</div>
                                            {tx.note && <div className={styles.note}>{tx.note}</div>}
                                        </div>
                                    </div>

                                    <div className={styles.amount}>{tx.amount} Kč</div>

                                    <div className={styles.actions}>
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(tx.id)}
                                            title="Edit"
                                            className={styles.iconBtn}
                                        >
                                            ⚙️
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(tx.id)}
                                            title="Delete"
                                            className={styles.iconBtn}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </li>

                            );
                        })}
                    </ul>
                )}
            </div>

            {editTxId && (
                <div onClick={closeEditModal} className={styles.modalOverlay}><div onClick={(e) => e.stopPropagation()} className={styles.modal}>

                        <h3 style={{marginTop: 0}}>Edit transaction</h3>
                        <div style={{color: '#666', marginBottom: 12}}>
                            Transaction id: <b>{editTxId}</b>
                        </div>

                        <div style={{display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14}}>
                            {/* DATE */}
                            <label style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                                <div style={{fontSize: 12, color: '#666'}}>Date</div>
                                <input
                                    type="date"
                                    value={editTxForm.date}
                                    onChange={(e) => setEditTxForm((s) => ({...s, date: e.target.value}))}
                                    style={{
                                        padding: '10px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: 8,
                                    }}
                                />
                            </label>

                            {/* AMOUNT */}
                            <label style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                                <div style={{fontSize: 12, color: '#666'}}>Amount (Kč)</div>
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    value={editTxForm.amount}
                                    onChange={(e) => setEditTxForm((s) => ({...s, amount: e.target.value}))}
                                    style={{
                                        padding: '10px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: 8,
                                    }}
                                />
                            </label>

                            {/* CATEGORY */}
                            <label style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                                <div style={{fontSize: 12, color: '#666'}}>Category</div>
                                <select
                                    value={editTxForm.categoryId}
                                    onChange={(e) => setEditTxForm((s) => ({...s, categoryId: e.target.value}))}
                                    style={{
                                        padding: '10px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: 8,
                                        background: '#fff',
                                    }}
                                >
                                    {/* show all categories except system ones */}
                                    {categories.filter((c) => !c.isSystem).map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.icon} {c.name}
                                        </option>
                                    ))}

                                    {/* we'll add the system "Uncategorized" as a separate option at the end */}
                                    <option value={UNCATEGORIZED_ID}>❔ Uncategorized</option>
                                </select>
                            </label>
                        </div>

                        <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8}}>
                            <button
                                type="button"
                                onClick={closeEditModal}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: 8,
                                    background: '#fff',
                                    cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleSaveEditTransaction}
                                disabled={!isDirty}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: 8,
                                    background: isDirty ? '#f5f5f5' : '#eee',
                                    color: isDirty ? '#000' : '#999',
                                    cursor: isDirty ? 'pointer' : 'default',
                                }}
                            >
                                Save
                            </button>


                        </div>

                    </div>
                </div>
            )}

        </div>

    );
}
