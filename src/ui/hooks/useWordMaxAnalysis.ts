import { useEffect, useRef, useState } from "react"
import type { GearPiece, Inputs } from "../../engine/types"
import type { WordMaxRow, WorkerRequest, WorkerResponse } from "../../engine/dpsWorker"
import DpsWorker from "../../engine/dpsWorker?worker"
import { WORKER_DEBOUNCE_MS } from "./workerDebounce"

export interface WordMaxAnalysisResult {
  rows: WordMaxRow[]
  isPending: boolean
  forPieceId: string | null
}

export function useWordMaxAnalysis(inputs: Inputs, piece: GearPiece | null): WordMaxAnalysisResult {
  const workerRef = useRef<Worker | null>(null)
  const reqIdRef = useRef(0)
  const lastReceivedRef = useRef(-1)
  const [rows, setRows] = useState<WordMaxRow[]>([])
  const [forPieceId, setForPieceId] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    const w = new DpsWorker()
    workerRef.current = w
    w.onmessage = (e: MessageEvent<WorkerResponse>) => {
      if (e.data.kind !== "wordMax") return
      const { reqId, rows: nextRows, pieceId } = e.data
      if (reqId < lastReceivedRef.current) return
      lastReceivedRef.current = reqId
      setRows(nextRows)
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
    if (!w) return
    if (!piece) {
      setRows([])
      setForPieceId(null)
      setIsPending(false)
      return
    }
    const reqId = ++reqIdRef.current
    setIsPending(true)
    const handle = setTimeout(() => {
      const req: WorkerRequest = {
        kind: "wordMax",
        reqId,
        inputs,
        piece,
      }
      w.postMessage(req)
    }, WORKER_DEBOUNCE_MS)
    return () => clearTimeout(handle)
  }, [inputs, piece])

  return { rows, isPending, forPieceId }
}
