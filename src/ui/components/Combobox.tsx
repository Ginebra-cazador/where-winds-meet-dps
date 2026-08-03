import { useEffect, useMemo, useRef, useState } from "react"

export interface ComboboxOption {
  value: string
  label: string
}

interface Props {
  value: string
  options: ComboboxOption[]
  onChange(value: string): void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function Combobox({ value, options, onChange, placeholder, disabled, className }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [highlight, setHighlight] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = options.find((o) => o.value === value)
  const displayText = open ? query : (selected?.label ?? "")

  const filtered = useMemo(() => {
    if (!open) return options
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [open, query, options])

  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onMouseDown)
    return () => document.removeEventListener("mousedown", onMouseDown)
  }, [open])

  useEffect(() => {
    if (highlight >= filtered.length) setHighlight(Math.max(0, filtered.length - 1))
  }, [filtered.length, highlight])

  function commit(opt: ComboboxOption) {
    onChange(opt.value)
    setOpen(false)
    setQuery("")
    inputRef.current?.blur()
  }

  function openWithReset() {
    setOpen(true)
    setQuery("")
    const idx = options.findIndex((o) => o.value === value)
    setHighlight(idx >= 0 ? idx : 0)
  }

  return (
    <div ref={wrapperRef} className={"combobox" + (className ? ` ${className}` : "")}>
      <input
        ref={inputRef}
        type="text"
        className="combobox-input"
        value={displayText}
        title={displayText}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        onFocus={openWithReset}
        onChange={(e) => {
          setQuery(e.target.value)
          setHighlight(0)
          setOpen(true)
        }}
        onKeyDown={(e) => {
          if (disabled) return
          if (e.key === "ArrowDown") {
            e.preventDefault()
            if (!open) {
              openWithReset()
              return
            }
            setHighlight((h) => Math.min(h + 1, Math.max(0, filtered.length - 1)))
          } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setHighlight((h) => Math.max(h - 1, 0))
          } else if (e.key === "Enter") {
            if (open && filtered[highlight]) {
              e.preventDefault()
              commit(filtered[highlight])
            }
          } else if (e.key === "Escape") {
            if (open) {
              e.preventDefault()
              setOpen(false)
              setQuery("")
            }
          } else if (e.key === "Tab") {
            setOpen(false)
            setQuery("")
          }
        }}
      />
      {open && filtered.length > 0 && (
        <ul className="combobox-dropdown" role="listbox">
          {filtered.map((opt, i) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              title={opt.label}
              className={
                "combobox-option" +
                (i === highlight ? " is-highlight" : "") +
                (opt.value === value ? " is-selected" : "")
              }
              onMouseDown={(e) => {
                e.preventDefault()
                commit(opt)
              }}
              onMouseEnter={() => setHighlight(i)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
      {open && filtered.length === 0 && (
        <ul className="combobox-dropdown" role="listbox">
          <li className="combobox-empty">—</li>
        </ul>
      )}
    </div>
  )
}
