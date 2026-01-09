import styles from './CategoryCard.module.css'

const CategoryCard = (props) => {
    const {
        icon,
        name,
        color,
        amount,
        onClick,
        showDelete,
        onDelete,
        showEdit,
        onEdit,
    } = props

    return (
        <div
            className={styles.card}
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            {/* Icon */}
            <div
                className={styles.icon}
                style={{ backgroundColor: color || '#ddd' }}
            >
                {icon}
            </div>

            {/* Name and amount */}
            <div className={styles.content}>
                <div className={styles.name}>{name}</div>
                <div className={styles.amount}>{amount ?? 0} Kč</div>
            </div>

            {/* Action buttons */}
            <div className={styles.actions}>
                {showEdit && (
                    <button
                        type="button"
                        title="Edit"
                        className={styles.iconBtn}
                        onClick={(e) => {
                            e.stopPropagation()
                            onEdit?.()
                        }}
                    >
                        ⚙️
                    </button>
                )}

                {showDelete && (
                    <button
                        type="button"
                        title="Delete"
                        className={styles.iconBtn}
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete?.()
                        }}
                    >
                        ×
                    </button>
                )}
            </div>
        </div>
    )
}

export default CategoryCard
