import { useEffect, useRef, useState } from "react"
import type { GearPiece, Inputs } from "../../engine/types"
import type { DpsDelta, WorkerRequest, WorkerResponse } from "../../engine/dpsWorker"
import DpsWorker from "../../engine/dpsWorker?worker"
import { WORKER_DEBOUNCE_MS } from "./workerDebounce"

export type DpsDeltaMap = Record<string, DpsDelta | undefined>

export interface DpsDeltasResult {
  deltas: DpsDeltaMap
  isPending: boolean
}

const NO_EXTRAS: readonly GearPiece[] = []

const EMPTY_DELTAS: DpsDeltaMap = {}

export function useDpsDeltas(
  inputs: Inputs,
  baselineDps: number,
  extraCandidates: readonly GearPiece[] = NO_EXTRAS,
): DpsDeltasResult {
  const workerRef = useRef<Worker | null>(null)
  const reqIdRef = useRef(0)
  const lastReceivedRef = useRef(-1)
  const [deltas, setDeltas] = useState<DpsDeltaMap>({})
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    const w = new DpsWorker()
    workerRef.current = w
    w.onmessage = (e: MessageEvent<WorkerResponse>) => {
      if (e.data.kind !== "dpsDeltas") return
      const { reqId, deltas: next } = e.data
      if (reqId < lastReceivedRef.current) return
      lastReceivedRef.current = reqId
      setDeltas(next)
      if (reqId === reqIdRef.current) setIsPending(false)
    }
    return () => {
      w.terminate()
      workerRef.current = null
    }
  }, [])

  const hasCandidates = inputs.inventory.length > 0 || extraCandidates.length > 0

  useEffect(() => {
    const w = workerRef.current
    if (!w || !hasCandidates) return
    const reqId = ++reqIdRef.current
    setIsPending(true)
    const handle = setTimeout(() => {
      const req: WorkerRequest = {
        kind: "dpsDeltas",
        reqId,
        inputs,
        baselineDps,
        pieceIds: [...inputs.inventory.map((p) => p.id), ...extraCandidates.map((p) => p.id)],
        extraCandidates: extraCandidates.length > 0 ? [...extraCandidates] : undefined,
      }
      w.postMessage(req)
    }, WORKER_DEBOUNCE_MS)
    return () => clearTimeout(handle)
  }, [inputs, baselineDps, extraCandidates, hasCandidates])

  if (!hasCandidates) return { deltas: EMPTY_DELTAS, isPending: false }
  return { deltas, isPending }
}
