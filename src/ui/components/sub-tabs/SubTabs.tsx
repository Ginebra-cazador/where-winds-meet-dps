import styles from "./SubTabs.module.scss"

export function SubTabs<T extends string>({
  tabs,
  active,
  onSelect,
}: {
  tabs: { key: T; label: string }[]
  active: T
  onSelect: (key: T) => void
}) {
  return (
    <div className={styles.subtabs} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={tab.key === active}
          className={styles.subtab + (tab.key === active ? ` ${styles.active}` : "")}
          onClick={() => onSelect(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
