import { useEffect, useRef, useState } from "react"
import type { Inputs } from "../../engine/types"
import type { ReattunementOption, WorkerRequest, WorkerResponse } from "../../engine/dpsWorker"
import DpsWorker from "../../engine/dpsWorker?worker"
import { WORKER_DEBOUNCE_MS } from "./workerDebounce"

export type ReattunementReason = "ok" | "no-piece" | "no-pool" | "no-selection"

export interface ReattunementAnalysisResult {
  options: ReattunementOption[]
  probImproveOverall: number
  reason: ReattunementReason
  isPending: boolean
  forPieceId: string | null
}

const NO_SELECTION_RESULT: ReattunementAnalysisResult = {
  options: [],
  probImproveOverall: 0,
  reason: "no-selection",
  forPieceId: null,
  isPending: false,
}

export function useReattunementAnalysis(
  inputs: Inputs,
  selectedPieceId: string | null,
): ReattunementAnalysisResult {
  const workerRef = useRef<Worker | null>(null)
  const reqIdRef = useRef(0)
  const lastReceivedRef = useRef(-1)
  const [options, setOptions] = useState<ReattunementOption[]>([])
  const [probImproveOverall, setProbImproveOverall] = useState(0)
  const [reason, setReason] = useState<ReattunementReason>("no-selection")
  const [forPieceId, setForPieceId] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    const w = new DpsWorker()
    workerRef.current = w
    w.onmessage = (e: MessageEvent<WorkerResponse>) => {
      if (e.data.kind !== "reattunement") return
      const {
        reqId,
        options: nextOpts,
        reason: nextReason,
        pieceId,
        probImproveOverall: nextProb,
      } = e.data
      if (reqId < lastReceivedRef.current) return
      lastReceivedRef.current = reqId
      setOptions(nextOpts)
      setProbImproveOverall(nextProb)
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
        kind: "reattunement",
        reqId,
        inputs,
        pieceId: selectedPieceId,
      }
      w.postMessage(req)
    }, WORKER_DEBOUNCE_MS)
    return () => clearTimeout(handle)
  }, [inputs, selectedPieceId])

  if (!selectedPieceId) return NO_SELECTION_RESULT
  return { options, probImproveOverall, reason, isPending, forPieceId }
}
