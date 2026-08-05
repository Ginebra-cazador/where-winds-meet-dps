import { useEffect, useRef, useState } from "react"
import type { Inputs } from "../../engine/types"
import type { RetunementRow, WorkerRequest, WorkerResponse } from "../../engine/dpsWorker"
import DpsWorker from "../../engine/dpsWorker?worker"
import { WORKER_DEBOUNCE_MS } from "./workerDebounce"

export type RetunementReason = "ok" | "no-piece" | "no-pool" | "relayed" | "no-selection"

export interface RetunementAnalysisResult {
  rows: RetunementRow[]
  reason: RetunementReason
  isPending: boolean
  forPieceId: string | null
}

const NO_SELECTION_RESULT: RetunementAnalysisResult = {
  rows: [],
  reason: "no-selection",
  forPieceId: null,
  isPending: false,
}

export function useRetunementAnalysis(
  inputs: Inputs,
  selectedPieceId: string | null,
): RetunementAnalysisResult {
  const workerRef = useRef<Worker | null>(null)
  const reqIdRef = useRef(0)
  const lastReceivedRef = useRef(-1)
  const [rows, setRows] = useState<RetunementRow[]>([])
  const [reason, setReason] = useState<RetunementReason>("no-selection")
  const [forPieceId, setForPieceId] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    const w = new DpsWorker()
    workerRef.current = w
    w.onmessage = (e: MessageEvent<WorkerResponse>) => {
      if (e.data.kind !== "retunement") return
      const { reqId, rows: nextRows, reason: nextReason, pieceId } = e.data
      if (reqId < lastReceivedRef.current) return
      lastReceivedRef.current = reqId
      setRows(nextRows)
      setReason(nextReason)
      setForPieceId(pieceId)
      if (reqId === reqIdRef.current) setIsPending(false)
    }
    return () => {
      w.terminate()
      workerRef.current = null
    }
  }, [])

  useEffect(() => {
    const w = workerRef.current
    if (!w || !selectedPieceId) return
    const reqId = ++reqIdRef.current
    setIsPending(true)
    const handle = setTimeout(() => {
      const req: WorkerRequest = {
        kind: "retunement",
        reqId,
        inputs,
        pieceId: selectedPieceId,
      }
      w.postMessage(req)
    }, WORKER_DEBOUNCE_MS)
    return () => clearTimeout(handle)
  }, [inputs, selectedPieceId])

  if (!selectedPieceId) return NO_SELECTION_RESULT
  return { rows, reason, isPending, forPieceId }
}
