import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { useI18n } from "../../../i18n/I18nContext"
import styles from "./ConfirmDialog.module.scss"

type ConfirmFn = (message: string) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext)
  if (!ctx) {
    throw new Error("useConfirm must be used within <ConfirmProvider>")
  }
  return ctx
}

interface PendingState {
  message: string
  resolve: (ok: boolean) => void
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const { t } = useI18n()
  const [pending, setPending] = useState<PendingState | null>(null)
  const okButtonRef = useRef<HTMLButtonElement | null>(null)

  const confirm = useCallback<ConfirmFn>((message) => {
    return new Promise<boolean>((resolve) => {
      setPending({ message, resolve })
    })
  }, [])

  function close(ok: boolean) {
    if (!pending) return
    pending.resolve(ok)
    setPending(null)
  }

  useEffect(() => {
    if (!pending) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault()
        close(false)
      } else if (e.key === "Enter") {
        e.preventDefault()
        close(true)
      }
    }
    document.addEventListener("keydown", onKey)
    okButtonRef.current?.focus()
    return () => document.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending])

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && (
        <div
          className={styles.confirmOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-message"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close(false)
          }}
        >
          <div className={styles.confirmModal}>
            <p id="confirm-message" className={styles.confirmMessage}>
              {pending.message}
            </p>
            <div className={styles.confirmButtons}>
              <button type="button" className="btn" onClick={() => close(false)}>
                {t("Cancel")}
              </button>
              <button
                type="button"
                ref={okButtonRef}
                className="btn primary"
                onClick={() => close(true)}
              >
                {t("Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}
