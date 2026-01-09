import { useEffect, useMemo, useState, useRef } from 'react';
import styles from './PeriodPicker.module.css';


// ===== утилиты форматов дат =====
function todayStr() {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`; // YYYY-MM-DD
}
function thisMonthStr() {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${mm}`; // YYYY-MM
}
function formatHumanDay(yyyyMmDd) {
    if (!yyyyMmDd) return '—';
    const [y, m, d] = yyyyMmDd.split('-').map(Number);
    // короткое безопасное форматирование без зависимостей:
    return `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${y}`;
}
function formatHumanMonth(yyyyMm) {
    if (!yyyyMm) return '—';
    const [y, m] = yyyyMm.split('-').map(Number);
    return `${String(m).padStart(2, '0')}.${y}`; // 03.2025
}

// ===== экспортируемая метка периода =====
export function formatPeriodLabel(period) {
    switch (period?.type) {
        case 'day':
            return formatHumanDay(period.day);
        case 'month':
            return formatHumanMonth(period.month);
        case 'range':
            return `${formatHumanDay(period.from)} – ${formatHumanDay(period.to)}`;
        case 'all':
        default:
            return 'All time';
    }
}

const MONTHS = [
    { value: '01', label: 'Jan' }, { value: '02', label: 'Feb' }, { value: '03', label: 'Mar' },
    { value: '04', label: 'Apr' }, { value: '05', label: 'May' }, { value: '06', label: 'Jun' },
    { value: '07', label: 'Jul' }, { value: '08', label: 'Aug' }, { value: '09', label: 'Sep' },
    { value: '10', label: 'Oct' }, { value: '11', label: 'Nov' }, { value: '12', label: 'Dec' },
];

function getYearsAround(currentYear = new Date().getFullYear(), span = 6) {
    const years = [];
    for (let y = currentYear - span; y <= currentYear + span; y++) years.push(y);
    return years;
}


/**
 * PeriodPicker
 * props:
 *  - value: {type:'all'|'day'|'month'|'range', ...}
 *  - onChange: (nextPeriod) => void
 *
 * Пример value:
 *  { type: 'all' }
 *  { type: 'day', day: '2025-03-19' }
 *  { type: 'month', month: '2025-03' }
 *  { type: 'range', from: '2025-03-01', to: '2025-03-31' }
 */
export default function PeriodPicker({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);


    // Черновики выбора внутри попапа
    const [mode, setMode] = useState(value?.type || 'all');
    const [day, setDay] = useState(() => (value?.type === 'day' ? value.day : todayStr()));
    const [month, setMonth] = useState(() => (value?.type === 'month' ? value.month : thisMonthStr()));
    const [from, setFrom] = useState(() => (value?.type === 'range' ? value.from : todayStr()));
    const [to, setTo] = useState(() => (value?.type === 'range' ? value.to : todayStr()));

    // Когда открываем панель — синхронизируем черновики с текущим value
    useEffect(() => {
        if (!open) return;
        setMode(value?.type || 'all');
        if (value?.type === 'day') {
            setDay(value.day);
        } else {
            setDay(todayStr());
        }
        if (value?.type === 'month') {
            setMonth(value.month);
        } else {
            setMonth(thisMonthStr());
        }
        if (value?.type === 'range') {
            setFrom(value.from);
            setTo(value.to);
        } else {
            const t = todayStr();
            setFrom(t);
            setTo(t);
        }
    }, [open, value]);

    // закрытие формы выбора даты по клику вне формы
    useEffect(() => {
        if (!open) return;
        function onDocClick(e) {
            if (!rootRef.current) return;
            if (!rootRef.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [open]);

    // закрытие формы выбора даты вне Esc
    useEffect(() => {
        if (!open) return;
        function onKey(e) { if (e.key === 'Escape') setOpen(false); }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);



    const rangeValid = useMemo(() => {
        if (mode !== 'range') return true;
        if (!from || !to) return false;
        return from <= to;
    }, [mode, from, to]);


    function apply() {
        let next;
        switch (mode) {
            case 'day':
                if (!day) return;
                next = { type: 'day', day };
                break;
            case 'month':
                if (!month) return;
                next = { type: 'month', month };
                break;
            case 'range':
                if (!rangeValid) return;
                next = { type: 'range', from, to };
                break;
            case 'all':
            default:
                next = { type: 'all' };
        }
        onChange?.(next);
        setOpen(false);
    }

    function setPresetToday() {
        setMode('day');
        setDay(todayStr());
    }
    function setPresetThisMonth() {
        setMode('month');
        setMonth(thisMonthStr());
    }
    function setPresetAllTime() {
        setMode('all');
    }

    const label = useMemo(() => formatPeriodLabel(value), [value]);
    // ===== month helpers (для режима 'month') =====
// month хранится как "YYYY-MM"
    const [yearPart, monthPart] = (month || thisMonthStr()).split('-');

    function setMonthPart(mm) {
        setMonth(`${yearPart}-${mm}`);
    }

    function setYearPart(yyyy) {
        setMonth(`${yyyy}-${monthPart}`);
    }



    return (
        <div ref={rootRef} className={styles.root}>


            {/* Триггер-кнопка с текущей меткой периода */}
            <button
                type="button"
                title="Change period"
                className={styles.trigger}
                onClick={() => setOpen((v) => !v)}
            >
                {label}
            </button>


            {/* Панель выбора */}
            {open && (
                <div className={styles.popover}>


                    {/* Presets */}
                    <div className={styles.presetsGrid}>
                        <button
                            type="button"
                            onClick={setPresetToday}
                            className={`${styles.presetBtn} ${mode === 'day' ? styles.presetBtnActive : ''}`}
                        >
                            Today
                        </button>

                        <button
                            type="button"
                            onClick={setPresetThisMonth}
                            className={`${styles.presetBtn} ${mode === 'month' ? styles.presetBtnActive : ''}`}
                        >
                            This month
                        </button>

                        <button
                            type="button"
                            onClick={setPresetAllTime}
                            className={`${styles.presetBtn} ${mode === 'all' ? styles.presetBtnActive : ''}`}
                        >
                            All time
                        </button>

                        <button
                            type="button"
                            onClick={() => setMode('range')}
                            className={`${styles.presetBtn} ${mode === 'range' ? styles.presetBtnActive : ''}`}
                        >
                            Range
                        </button>
                    </div>


                    {/* Поля под выбранный режим */}
                    {mode === 'day' && (
                        <Field label="Day">
                            <input
                                type="date"
                                value={day}
                                onChange={e => setDay(e.target.value)}
                                className={styles.input}
                            />
                        </Field>
                    )}

                    {mode === 'month' && (
                        <Field label="Month">
                            <div className={styles.monthRow}>
                                <select
                                    className={styles.input}
                                    value={monthPart}
                                    onChange={(e) => setMonthPart(e.target.value)}
                                >
                                    {MONTHS.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>

                                <select
                                    className={styles.input}
                                    value={yearPart}
                                    onChange={(e) => setYearPart(e.target.value)}
                                >
                                    {getYearsAround(Number(yearPart)).map(y => (
                                        <option key={y} value={String(y)}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </Field>

                    )}

                    {mode === 'range' && (
                        <div className={styles.rangeGrid}>
                            <Field label="From">
                                <input
                                    type="date"
                                    value={from}
                                    onChange={e => setFrom(e.target.value)}
                                    className={styles.input}
                                />
                            </Field>

                            <Field label="To">
                                <input
                                    type="date"
                                    value={to}
                                    onChange={e => setTo(e.target.value)}
                                    className={styles.input}
                                />
                            </Field>

                            {!rangeValid && (
                                <div className={styles.rangeError}>
                                    Invalid range: "From" should be ≤ "To"
                                </div>
                            )}
                        </div>
                    )}


                    {/* Кнопки действий */}
                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnDanger}`}
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            onClick={apply}
                            disabled={mode === 'range' && !rangeValid}
                            title={mode === 'range' && !rangeValid ? 'Fix range first' : ''}
                        >
                            Apply
                        </button>
                    </div>


                </div>
            )}
        </div>
    );
}

// маленькие «компоненты» для читаемости
function Field({label, children}) {
    return (
        <label style={{display: 'grid', gap: 4}}>
            <span style={{fontSize: 12, color: '#666'}}>{label}</span>
            {children}
        </label>
    );
}

function btn() {
    return {
        padding: '6px 10px',
        border: '1px solid #ddd',
        borderRadius: 8,
        background: '#fff',
        cursor: 'pointer',
        whiteSpace: 'nowrap'
    };
}

function input() {
    return {
        padding: 8,
        border: '1px solid #ddd',
        borderRadius: 8,
        width: '100%',
        boxSizing: 'border-box',
    };
}
