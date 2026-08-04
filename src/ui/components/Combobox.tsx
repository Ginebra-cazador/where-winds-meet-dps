import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"

export interface ComboboxOption {
  value: string
  label: string
}

const DROPDOWN_MAX_HEIGHT = 240
const VIEWPORT_MARGIN = 8

interface DropdownPos {
  left: number
  width: number
  top?: number
  bottom?: number
  maxHeight: number
}

function measure(anchor: HTMLElement): DropdownPos {
  const r = anchor.getBoundingClientRect()
  const spaceBelow = window.innerHeight - r.bottom - VIEWPORT_MARGIN
  const spaceAbove = r.top - VIEWPORT_MARGIN
  const openUp = spaceBelow < Math.min(DROPDOWN_MAX_HEIGHT, spaceAbove) && spaceAbove > spaceBelow
  return {
    left: r.left,
    width: r.width,
    top: openUp ? undefined : r.bottom + 2,
    bottom: openUp ? window.innerHeight - r.top + 2 : undefined,
    maxHeight: Math.max(80, Math.min(DROPDOWN_MAX_HEIGHT, openUp ? spaceAbove : spaceBelow)),
  }
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
  const [pos, setPos] = useState<DropdownPos | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLUListElement>(null)

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
      const target = e.target as Node
      if (wrapperRef.current?.contains(target)) return
      if (dropdownRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener("mousedown", onMouseDown)
    return () => document.removeEventListener("mousedown", onMouseDown)
  }, [open])

  const reposition = useCallback(() => {
    if (wrapperRef.current) setPos(measure(wrapperRef.current))
  }, [])

  useLayoutEffect(() => {
    if (!open) {
      setPos(null)
      return
    }
    reposition()
    window.addEventListener("scroll", reposition, true)
    window.addEventListener("resize", reposition)
    return () => {
      window.removeEventListener("scroll", reposition, true)
      window.removeEventListener("resize", reposition)
    }
  }, [open, reposition])

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
      {open &&
        pos &&
        createPortal(
          <ul
            ref={dropdownRef}
            className="combobox-dropdown"
            role="listbox"
            style={{
              left: pos.left,
              width: pos.width,
              top: pos.top,
              bottom: pos.bottom,
              maxHeight: pos.maxHeight,
            }}
          >
            {filtered.length === 0 ? (
              <li className="combobox-empty">—</li>
            ) : (
              filtered.map((opt, i) => (
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
              ))
            )}
          </ul>,
          document.body,
        )}
    </div>
  )
}
