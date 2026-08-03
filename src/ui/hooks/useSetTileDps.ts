import { useEffect, useRef, useState } from "react"
import type { Inputs } from "../../engine/types"
import type { SetTilesWorkerResponse, WorkerRequest, WorkerResponse } from "../../engine/dpsWorker"
import DpsWorker from "../../engine/dpsWorker?worker"
import { WORKER_DEBOUNCE_MS } from "./workerDebounce"

export type SetTileDps = Pick<
  SetTilesWorkerResponse,
  "armorDpsByKey" | "bowDpsByChoice" | "arsenalDpsByChoice"
>

export interface SetTileDpsResult {
  data: SetTileDps | null
  isPending: boolean
}

export function useSetTileDps(inputs: Inputs): SetTileDpsResult {
  const workerRef = useRef<Worker | null>(null)
  const reqIdRef = useRef(0)
  const lastReceivedRef = useRef(-1)
  const [data, setData] = useState<SetTileDps | null>(null)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    const w = new DpsWorker()
    workerRef.current = w
    w.onmessage = (e: MessageEvent<WorkerResponse>) => {
      if (e.data.kind !== "setTiles") return
      const { reqId, armorDpsByKey, bowDpsByChoice, arsenalDpsByChoice } = e.data
      if (reqId < lastReceivedRef.current) return
      lastReceivedRef.current = reqId
      setData({ armorDpsByKey, bowDpsByChoice, arsenalDpsByChoice })
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
      const req: WorkerRequest = { kind: "setTiles", reqId, inputs }
      w.postMessage(req)
    }, WORKER_DEBOUNCE_MS)
    return () => clearTimeout(handle)
  }, [inputs])

  return { data, isPending }
}
