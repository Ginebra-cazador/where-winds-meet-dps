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
    <div className="subtabs" role="tablist">
      {tabs.map((tb) => (
        <button
          key={tb.key}
          type="button"
          role="tab"
          aria-selected={tb.key === active}
          className={"subtab" + (tb.key === active ? " active" : "")}
          onClick={() => onSelect(tb.key)}
        >
          {tb.label}
        </button>
      ))}
    </div>
  )
}
