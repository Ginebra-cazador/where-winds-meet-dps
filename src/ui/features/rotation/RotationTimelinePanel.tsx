import { useMemo } from "react"
import type { Result } from "../../../engine/types"
import { useI18n } from "../../../i18n/I18nContext"

export function RotationTimelinePanel({ result }: { result: Result }) {
  const { t } = useI18n()
  const duration = result.rotationDuration
  const events = result.timeline ?? []

  const eventsByLane = useMemo(() => {
    const map = new Map<string, typeof events>()
    for (const e of events) {
      const arr = map.get(e.skillName)
      if (arr) arr.push(e)
      else map.set(e.skillName, [e])
    }
    return map
  }, [events])

  if (events.length === 0 || duration <= 0) {
    return <div className="empty-tab">{t("(none)")}</div>
  }

  const minTime = Math.min(0, ...events.map((e) => e.timeSec))
  const span = Math.max(duration - minTime, 1e-6)
  const pct = (sec: number) => ((sec - minTime) / span) * 100

  const axisTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => minTime + f * span)

  const qb = result.qiBreakWindow
  const qiStart = qb ? Math.max(qb.startSec, minTime) : 0
  const qiEnd = qb ? Math.min(qb.endSec, duration) : 0
  const showQi = qb != null && qiEnd > qiStart

  return (
    <div className="timeline-panel">
      <div className="timeline-scroll">
        <div className="timeline-track">
          {showQi && (
            <div className="timeline-buff-group">
              <span className="timeline-buff-group-label">{t("Qi Break Window")}</span>
              <div className="timeline-buff-lane">
                <div
                  className="timeline-buff-span timeline-qi-break"
                  style={{
                    left: pct(qiStart) + "%",
                    width: Math.max(pct(qiEnd) - pct(qiStart), 0.3) + "%",
                  }}
                  title={`${t("Qi Break Window")} — ${qiStart.toFixed(2)}s – ${qiEnd.toFixed(2)}s`}
                >
                  <span className="timeline-buff-label">{t("Qi Break Window")}</span>
                </div>
              </div>
            </div>
          )}
          {[...eventsByLane.entries()].map(([name, laneEvents]) => (
            <div key={name} className="timeline-lane">
              <span className="timeline-lane-label">{t(name)}</span>
              <div className="timeline-lane-track">
                {laneEvents.map((e, i) => (
                  <div
                    key={i}
                    className={
                      "timeline-event" +
                      (e.kind === "dot" ? " dot" : "") +
                      (!e.inWindow ? " out-of-window" : "")
                    }
                    style={{ left: pct(e.timeSec) + "%" }}
                    title={`${e.skillName} — ${Math.max(0, e.timeSec).toFixed(2)}s — ${Math.round(e.damage).toLocaleString()}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="timeline-axis">
          {axisTicks.map((sec, i) => (
            <span key={i} className="timeline-axis-tick" style={{ left: pct(sec) + "%" }}>
              {Math.max(0, sec).toFixed(1)}s
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
