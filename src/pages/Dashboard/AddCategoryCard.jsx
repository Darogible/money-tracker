import styles from './AddCategoryCard.module.css';

export default function AddCategoryCard({ onAdd }) {
    return (
        <div
            onClick={onAdd}
            className={styles.card}
            title="Add category"
        >
            <span className={styles.icon}>＋</span>
            <span className={styles.text}>Add category</span>
        </div>
    );
}
