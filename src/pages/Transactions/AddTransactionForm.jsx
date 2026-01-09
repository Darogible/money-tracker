import { useEffect, useRef, useState } from 'react';
import styles from './AddTransactionForm.module.css';


// local helper - date 'YYYY-MM-DD' for today
function todayStr() {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
}

/**
 * Props:
 * - categories: [{id, name, icon, color}]
 * - initialCategoryId?: string (from URL)
 * - onAdd: ({amount:number, categoryId:string, date:'YYYY-MM-DD', note?:string}) => void
 */
export default function AddTransactionForm({ categories, initialCategoryId = '', onAdd }) {
    const [form, setForm] = useState({
        amount: '',
        categoryId: '',
        date: todayStr(),                             // default: today
        note: '',
    });


    useEffect(() => {
        if (!initialCategoryId) return;
        const exists = categories.some(c => c.id === initialCategoryId);
        if (exists) {
            setForm(s => ({ ...s, categoryId: initialCategoryId }));
        }
    }, [initialCategoryId, categories]);

    // focus on the amount
    const amountRef = useRef(null);
    useEffect(() => {
        amountRef.current?.focus();
    }, []);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(s => ({ ...s, [name]: value }));
    }

    function handleSubmit(e) {
        e.preventDefault();

        const amountNum = Number(form.amount);
        if (!Number.isFinite(amountNum) || amountNum <= 0) return;
        if (!form.categoryId) return;
        const dateStr = form.date || todayStr();

        const payload = {
            amount: amountNum,
            categoryId: form.categoryId,
            date: dateStr,
            note: form.note.trim() ? form.note.trim() : undefined,
        };

        onAdd?.(payload);

        // after adding, leave the date and category
        setForm(s => ({ ...s, amount: '', note: '' }));
        amountRef.current?.focus();
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {/* Amount */}
            <div className={styles.field}>
                <label className={styles.label}>Amount</label>
                <input
                    ref={amountRef}
                    type="number"
                    step="0.01"
                    min="0"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={styles.control}
                />
            </div>

            {/* Category */}
            <div className={styles.field}>
                <label className={styles.label}>Category</label>
                <select
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
                    className={styles.control}
                >
                    <option value="">Select category…</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.icon} {c.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Date */}
            <div className={styles.field}>
                <label className={styles.label}>Date</label>
                <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className={styles.control}
                />
            </div>

            {/* Note */}
            <div className={styles.field}>
                <label className={styles.label}>Note</label>
                <input
                    type="text"
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    placeholder="optional"
                    className={styles.control}
                />
            </div>

            {/* Submit */}
            <button type="submit" className={styles.submit}>
                Add
            </button>
        </form>
    );

}
