import { useEffect, useState } from 'react'
import { seedCategories, UNCATEGORIZED_ID } from '../../entities/categories/seed';
import CategoryGrid from './CategoryGrid';
import AddCategoryCard from './AddCategoryCard';
import {useNavigate} from "react-router-dom";
import PeriodPicker, { formatPeriodLabel } from '../../shared/ui/PeriodPicker';
import DashboardDonut from "./DashboardDonut.jsx";
import { CATEGORY_ICONS } from '../../entities/categories/icons';
import styles from './Dashboard.module.css';



const LOCAL_STORAGE_KEY = 'moneyTracker_categories';
const TRANSACTIONS_KEY = 'moneyTracker_transactions';

function shiftDay(yyyyMmDd, delta) {
    if (!yyyyMmDd) return yyyyMmDd;
    const [y, m, d] = yyyyMmDd.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + delta);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${mm}-${dd}`;
}

function shiftMonth(yyyyMm, delta) {
    if (!yyyyMm) return yyyyMm;
    const [y, m] = yyyyMm.split('-').map(Number);
    const date = new Date(y, m - 1, 1);
    date.setMonth(date.getMonth() + delta);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return `${date.getFullYear()}-${mm}`;
}


export default function Dashboard() {

    // read from localStorage or use default categories
    const [categories, setCategories] = useState(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (!saved) return seedCategories;
            const parsed = JSON.parse(saved);
            //Array.isArray - checks if an array is an array
            return Array.isArray(parsed) ? parsed : seedCategories;
        } catch {
            return seedCategories;
        }
    });

    const [transactions, setTransactions] = useState(() => {
        try {
            const raw = localStorage.getItem(TRANSACTIONS_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    });


    // every time the categories change, we save them in localStorage
    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(categories));
        } catch (error) {
            console.warn('Error saving categories:', error);
        }
    }, [categories]);

    // State for the add form
    const [isAdding, setIsAdding] = useState(false);
    const [newCat, setNewCat] = useState({
        name: '',
        icon: '🟢',
        color: '#f7f7f7',
    });

    const [isEdit, setIsEdit] = useState(false);


    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    function openAddModal() {
        setIsAddModalOpen(true);
    }

    function closeAddModal() {
        setIsAddModalOpen(false);
        setNewCat({ name: '', icon: '🟢', color: '#f7f7f7' });
        setIsIconPickerOpen(false);
    }




    function handleSubmit(e) {
        e.preventDefault();

        const name = newCat.name.trim();
        const icon = newCat.icon.trim();
        const color = newCat.color.trim();

        if (!name || !icon) return; // minimal validation

        const id = 'cat-' + (crypto?.randomUUID?.() || Date.now());

        setCategories((prev) => [...prev, {id, name, icon, color}]);
        setIsAddModalOpen(false);
        setNewCat({ name: '', icon: '🟢', color: '#f7f7f7' });

    }

    // Delete a category and move its transactions to "Uncategorized"
    function handleDeleteCategory(deletedId) {
        const cat = categories.find((c) => c.id === deletedId);

        // Do not allow deleting system categories
        if (cat?.isSystem) return;

        const ok = window.confirm('Delete this category? Transactions will be moved to Uncategorized.');
        if (!ok) return;

        // Move existing transactions to the fallback category (UNCATEGORIZED_ID)
        let migrated = [];
        try {
            const raw = localStorage.getItem(TRANSACTIONS_KEY);
            const txs = raw ? JSON.parse(raw) : [];
            const list = Array.isArray(txs) ? txs : [];

            migrated = list.map((tx) =>
                tx.categoryId === deletedId ? { ...tx, categoryId: UNCATEGORIZED_ID } : tx
            );

            localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(migrated));
        } catch (e) {
            console.warn('Failed to migrate transactions:', e);
        }

        // that the Dashboard recalculates the amounts immediately, without restarting
        if (migrated.length) setTransactions(migrated);

        setCategories((prev) => prev.filter((c) => c.id !== deletedId));
        if (editCatId === deletedId) closeEditModal();
    }


    // Navigate to a specific category in a transaction
    const navigate = useNavigate();

    function handleCategoryClick(categoryId) {
        if (isEdit) return; // in editing mode, clicks on cards are ignored
        navigate(`/transactions?categoryId=${encodeURIComponent(categoryId)}`);
    }


    function filterByPeriod(transactions, p) {
        if (!p || p.type === 'all') return transactions;

        if (p.type === 'day') {
            return transactions.filter(tx => tx.date === p.day);
        }
        if (p.type === 'month') {
            return transactions.filter(tx => tx.date?.startsWith(p.month));
        }
        if (p.type === 'range') {
            const from = p.from;
            const to = p.to;
            return transactions.filter(tx => tx.date >= from && tx.date <= to);
        }
        return transactions;
    }

    // PeriodPickes.jsx
    const [period, setPeriod] = useState({ type: 'all' });
    const filteredTx = filterByPeriod(transactions, period);

    const sumByCategory = new Map();
    for (const tx of filteredTx) {
        const prev = sumByCategory.get(tx.categoryId) ?? 0;
        sumByCategory.set(tx.categoryId, prev + Number(tx.amount || 0));
    }

    const totalAllTime = [...sumByCategory.values()].reduce((s, x) => s + x, 0);

    // Prepare data for the grid (while sums = 0)
    const dashboardCategories = categories.filter(c => !c.isSystem);
    const gridItems = dashboardCategories.map(item => ({
        id: item.id,
        name: item.name,
        icon: item.icon,
        color: item.color,
        isSystem: !!item.isSystem,
        amount: +(sumByCategory.get(item.id) ?? 0).toFixed(2),
    }));

    const uncatCategory = categories.find(c => c.id === UNCATEGORIZED_ID) || {
        id: UNCATEGORIZED_ID,
        name: 'Uncategorized',
        icon: '❔',
        color: '#9E9E9E',
        isSystem: true,
    };

    const chartCategories = [...dashboardCategories, uncatCategory];

    const totalAll = [...sumByCategory.values()].reduce((s, x) => s + x, 0);
    const totalFormatted = totalAll.toFixed(2);

    // DashboardDonut
    const chartData = chartCategories
        .map((c) => ({
            name: c.name,
            value: +(sumByCategory.get(c.id) ?? 0).toFixed(2),
            color: c.color,
            id: c.id,
        }))
        .filter((d) => d.value > 0);


    const [editCatId, setEditCatId] = useState(null);
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);


    function handleEditCategory(id) {
        setEditCatId(id);
        setIsIconPickerOpen(false);
    }

    function closeEditModal() {
        setEditCatId(null);
        setIsIconPickerOpen(false);
    }

    function handleSaveEditCategory() {
        if (!editCatId) return;

        const nextName = editForm.name.trim();
        const nextIcon = editForm.icon.trim();
        const nextColor = (editForm.color || '').trim();


        // simple validation to not save an empty name
        if (!nextName) return;

        setCategories((prevCategories) =>
            prevCategories.map((c) => {
                if (c.id !== editCatId) return c;
                return {
                    ...c,
                    name: nextName,
                    icon: nextIcon || c.icon,
                    color: nextColor || c.color,
                };

            })
        );

        closeEditModal();
    }


    // object of the category we are currently editing (or null)
    const editingCategory = editCatId
        ? categories.find((c) => c.id === editCatId) ?? null
        : null;


    const [editForm, setEditForm] = useState({ name: '', icon: '', color: '#9E9E9E' });


    useEffect(() => {
        if (!editCatId) return;          // modal closed → do nothing
        if (!editingCategory) return;

        setEditForm({
            name: editingCategory.name ?? '',
            icon: editingCategory.icon ?? '',
            color: editingCategory.color ?? '#9E9E9E',
        });
    }, [editCatId, editingCategory]);


    const isDirty =
        !!editingCategory &&
        (
            editForm.name !== (editingCategory.name ?? '') ||
            editForm.icon !== (editingCategory.icon ?? '') ||
            editForm.color !== (editingCategory.color ?? '#9E9E9E')
        );



    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div className={styles.titleBlock}>
                    <h2 className={styles.title}>Your expenses</h2>
                    <div className={styles.total}>{totalFormatted} Kč</div>
                </div>

                <div className={styles.controls}>
                    <button
                        type="button"
                        onClick={() => {
                            if (period.type === 'day') {
                                setPeriod((p) => ({ ...p, day: shiftDay(p.day, -1) }));
                            } else if (period.type === 'month') {
                                setPeriod((p) => ({ ...p, month: shiftMonth(p.month, -1) }));
                            }
                        }}
                        disabled={period.type === 'all' || period.type === 'range'}
                        className={styles.navBtn}
                        title="Previous"
                    >
                        ←
                    </button>

                    <PeriodPicker value={period} onChange={setPeriod} />

                    <button
                        type="button"
                        onClick={() => {
                            if (period.type === 'day') {
                                setPeriod((p) => ({ ...p, day: shiftDay(p.day, +1) }));
                            } else if (period.type === 'month') {
                                setPeriod((p) => ({ ...p, month: shiftMonth(p.month, +1) }));
                            }
                        }}
                        disabled={period.type === 'all' || period.type === 'range'}
                        className={styles.navBtn}
                        title="Next"
                    >
                        →
                    </button>
                </div>

                <button
                    type="button"
                    onClick={() => setIsEdit((prev) => !prev)}
                    className={styles.editBtn}
                >
                    {isEdit ? 'Done' : 'Edit'}
                </button>
            </div>

            <div className={styles.donutWrap}>
                <DashboardDonut data={chartData} total={totalAll} currency="Kč"/>
            </div>


            <CategoryGrid
                items={gridItems}
                isEdit={isEdit}
                onDeleteCategory={handleDeleteCategory}
                onCategoryClick={handleCategoryClick}
                onEditCategory={handleEditCategory}
            >
                {!isEdit && <AddCategoryCard onAdd={openAddModal} />}
            </CategoryGrid>

            {editCatId && (
                <div
                    onClick={closeEditModal}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 16,
                        zIndex: 1000,
                    }}

                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%',
                            maxWidth: 360,
                            boxSizing: 'border-box',
                            background: '#fff',
                            borderRadius: 12,
                            padding: 16,
                            border: '1px solid #eee',
                        }}

                    >
                        <h3 style={{marginTop: 0}}>Edit category</h3>

                        <div style={{display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14}}>
                            {/* NAME */}
                            <label style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                                <div style={{fontSize: 12, color: '#666'}}>Name</div>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) =>
                                        setEditForm((s) => ({...s, name: e.target.value}))
                                    }
                                    placeholder="Category name"
                                    style={{
                                        padding: '10px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: 8,
                                    }}
                                />
                            </label>

                            {/* ICON */}
                            <label style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                                <div style={{fontSize: 12, color: '#666'}}>Icon</div>

                                <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                                    <div
                                        style={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 12,
                                            border: '1px solid #ddd',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 22,
                                            background: '#fff',
                                        }}
                                        title="Selected icon"
                                    >
                                        {editForm.icon}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setIsIconPickerOpen((v) => !v)}
                                        style={{
                                            padding: '10px 12px',
                                            border: '1px solid #ddd',
                                            borderRadius: 8,
                                            background: '#fff',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {isIconPickerOpen ? 'Hide icons' : 'Choose icon'}
                                    </button>
                                </div>

                                {isIconPickerOpen && (
                                    <div
                                        style={{
                                            marginTop: 10,
                                            border: '1px solid #eee',
                                            borderRadius: 12,
                                            padding: 10,
                                            maxHeight: 220,
                                            overflowY: 'auto',
                                            overflowX: 'hidden',
                                            background: '#fafafa',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))',
                                                gap: 8,
                                            }}
                                        >
                                            {CATEGORY_ICONS.map((icon) => {
                                                const active = icon === editForm.icon;

                                                return (
                                                    <button
                                                        key={icon}
                                                        type="button"
                                                        onClick={() => {
                                                            setEditForm((s) => ({...s, icon}));
                                                            setIsIconPickerOpen(false);
                                                        }}
                                                        style={{
                                                            width: '100%',
                                                            height: 40,
                                                            padding: 0,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            border: active ? '2px solid #333' : '1px solid #ddd',
                                                            borderRadius: 10,
                                                            background: '#fff',
                                                            cursor: 'pointer',
                                                            fontSize: 20,
                                                            lineHeight: 1,
                                                        }}
                                                        title={icon}
                                                    >
                                                        {icon}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </label>


                            {/* COLOR */}
                            <label style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                                <div style={{fontSize: 12, color: '#666'}}>Color</div>

                                <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                                    <input
                                        type="color"
                                        value={editForm.color}
                                        onChange={(e) => setEditForm((s) => ({...s, color: e.target.value}))}
                                        style={{
                                            width: 48,
                                            height: 40,
                                            border: '1px solid #ddd',
                                            borderRadius: 8,
                                            padding: 0,
                                            background: 'transparent',
                                            cursor: 'pointer',
                                        }}
                                        title="Color"
                                    />

                                    <div style={{fontSize: 12, color: '#666'}}>
                                        {editForm.color}
                                    </div>
                                </div>
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
                                onClick={handleSaveEditCategory}
                                disabled={!isDirty}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: 8,
                                    background: isDirty ? '#fff' : '#f5f5f5',
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

            {isAddModalOpen && (
                <div
                    onClick={closeAddModal}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 16,
                        zIndex: 1000,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: 'min(420px, 100%)',
                            boxSizing: 'border-box',
                            background: '#fff',
                            borderRadius: 12,
                            padding: 16,
                            border: '1px solid #eee',
                        }}
                    >
                        <h3 style={{marginTop: 0}}>Add category</h3>

                        <form onSubmit={handleSubmit}>
                            <div style={{display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14}}>
                                {/* NAME */}
                                <label style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                                    <div style={{fontSize: 12, color: '#666'}}>Name</div>
                                    <input
                                        type="text"
                                        value={newCat.name}
                                        onChange={(e) => setNewCat((s) => ({...s, name: e.target.value}))}
                                        placeholder="Category name"
                                        style={{
                                            padding: '10px 12px',
                                            border: '1px solid #ddd',
                                            borderRadius: 8,
                                        }}
                                    />
                                </label>

                                {/* ICON */}
                                <label style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                                    <div style={{fontSize: 12, color: '#666'}}>Icon</div>

                                    <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                                        <div
                                            style={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 12,
                                                border: '1px solid #ddd',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 22,
                                                background: '#fff',
                                            }}
                                            title="Selected icon"
                                        >
                                            {newCat.icon}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setIsIconPickerOpen((v) => !v)}
                                            style={{
                                                padding: '10px 12px',
                                                border: '1px solid #ddd',
                                                borderRadius: 8,
                                                background: '#fff',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {isIconPickerOpen ? 'Hide icons' : 'Choose icon'}
                                        </button>
                                    </div>

                                    {isIconPickerOpen && (
                                        <div
                                            style={{
                                                marginTop: 10,
                                                border: '1px solid #eee',
                                                borderRadius: 12,
                                                padding: 10,
                                                maxHeight: 220,
                                                overflowY: 'auto',
                                                overflowX: 'hidden',

                                                background: '#fafafa',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))',
                                                    gap: 8,
                                                }}
                                            >
                                                {CATEGORY_ICONS.map((icon) => {
                                                    const active = icon === newCat.icon;
                                                    return (
                                                        <button
                                                            key={icon}
                                                            type="button"
                                                            onClick={() => {
                                                                setNewCat((s) => ({...s, icon}));
                                                                setIsIconPickerOpen(false);
                                                            }}
                                                            style={{
                                                                width: '100%',
                                                                height: 40,
                                                                padding: 0,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                border: active ? '2px solid #333' : '1px solid #ddd',
                                                                borderRadius: 10,
                                                                background: '#fff',
                                                                cursor: 'pointer',
                                                                fontSize: 20,
                                                                lineHeight: 1,
                                                            }}

                                                            title={icon}
                                                        >
                                                            {icon}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </label>


                                {/* COLOR */}
                                <label style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                                    <div style={{fontSize: 12, color: '#666'}}>Color</div>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                                        <input
                                            type="color"
                                            value={newCat.color}
                                            onChange={(e) => setNewCat((s) => ({...s, color: e.target.value}))}
                                            style={{
                                                width: 48,
                                                height: 40,
                                                border: '1px solid #ddd',
                                                borderRadius: 8,
                                                padding: 0,
                                                background: 'transparent',
                                                cursor: 'pointer',
                                            }}
                                        />
                                        <div style={{fontSize: 12, color: '#666'}}>{newCat.color}</div>
                                    </div>
                                </label>
                            </div>

                            <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8}}>
                                <button
                                    type="button"
                                    onClick={closeAddModal}
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
                                    type="submit"
                                    style={{
                                        padding: '8px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: 8,
                                        background: '#fff',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Add
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


        </div>
    );
}

