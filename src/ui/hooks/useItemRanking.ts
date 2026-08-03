import { useEffect, useRef, useState } from "react"
import type { Inputs, ItemRankingRow } from "../../engine/types"
import type { WorkerRequest, WorkerResponse } from "../../engine/dpsWorker"
import DpsWorker from "../../engine/dpsWorker?worker"
import { WORKER_DEBOUNCE_MS } from "./workerDebounce"

export interface ItemRankingResult {
  rows: ItemRankingRow[]
  isPending: boolean
}

export function useItemRanking(engineInputs: Inputs, baselineDps: number): ItemRankingResult {
  const workerRef = useRef<Worker | null>(null)
  const reqIdRef = useRef(0)
  const lastReceivedRef = useRef(-1)
  const [rows, setRows] = useState<ItemRankingRow[]>([])
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    const w = new DpsWorker()
    workerRef.current = w
    w.onmessage = (e: MessageEvent<WorkerResponse>) => {
      if (e.data.kind !== "ranking") return
      const { reqId, rows: next } = e.data
      if (reqId < lastReceivedRef.current) return
      lastReceivedRef.current = reqId
      setRows(next)
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
    const reqId = ++reqIdRef.current
    setIsPending(true)
    const handle = setTimeout(() => {
      const req: WorkerRequest = {
        kind: "ranking",
        reqId,
        inputs: engineInputs,
        baselineDps,
      }
      w.postMessage(req)
    }, WORKER_DEBOUNCE_MS)
    return () => clearTimeout(handle)
  }, [engineInputs, baselineDps])

  return { rows, isPending }
}
