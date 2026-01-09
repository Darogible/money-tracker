import CategoryCard from "./CategoryCard";
import styles from './CategoryGrid.module.css';


const CategoryGrid =
    ({
         items,
         children,
         isEdit,
         onDeleteCategory,
         onCategoryClick,
         onEditCategory,
     }) => {

        return (
            <div className={styles.grid}>
                {items.map((item) => (
                    <CategoryCard
                        key={item.id}
                        icon={item.icon}
                        name={item.name}
                        color={item.color}
                        amount={item.amount}
                        showDelete={isEdit && !item.isSystem}
                        showEdit={isEdit && !item.isSystem}
                        onEdit={() => onEditCategory?.(item.id)}
                        onDelete={() => onDeleteCategory?.(item.id)}
                        onClick={!isEdit ? () => onCategoryClick?.(item.id) : undefined}
                    />
                ))}

                {children}
            </div>
        );

    };

export default CategoryGrid;
