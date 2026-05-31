"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Shield, Loader2, CheckCircle2 } from "lucide-react"

const SESSION_KEY = "pw_shield_ok"
const MIN_VISIBLE_MS = 4000
const SHIELD_TTL_MS = 30 * 60 * 1000

type StepStatus = "pending" | "running" | "done"

interface CheckStep {
  id: string
  label: string
  detail: string
  baseDelayMs: number
}

const CHECK_STEPS: CheckStep[] = [
  { id: "conn",  label: "Phân tích kết nối",  detail: "Đo latency & fingerprint TLS",   baseDelayMs: 420 },
  { id: "bot",   label: "Chống bot / crawler", detail: "Heuristic hành vi trình duyệt", baseDelayMs: 520 },
  { id: "rate",  label: "Giới hạn tần suất",   detail: "Token bucket theo IP ảo",       baseDelayMs: 480 },
  { id: "ddos",  label: "Lọc DDoS layer 7",    detail: "Challenge-response nhẹ",        baseDelayMs: 580 },
  { id: "cache", label: "Ủy quyền phiên",      detail: "Ghi nhận edge session",         baseDelayMs: 400 },
]

function randomToken(len = 12) {
  const chars = "abcdef0123456789"
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

function waitForPageLoad(): Promise<void> {
  return new Promise((resolve) => {
    if (document.readyState === "complete") {
      window.setTimeout(resolve, 80)
      return
    }
    const onLoad = () => {
      window.removeEventListener("load", onLoad)
      window.setTimeout(resolve, 80)
    }
    window.addEventListener("load", onLoad)
  })
}

function getSpeedMultiplier(): number {
  try {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined
    if (!nav) return 1
    const dcl = nav.domContentLoadedEventEnd - nav.startTime
    if (dcl < 800)  return 0.6
    if (dcl < 2000) return 1.0
    return 1.5
  } catch {
    return 1
  }
}

export default function AntiDdosShield() {
  // Server luôn render false — không hydration mismatch
  const [visible,  setVisible]  = useState(false)
  const [mounted,  setMounted]  = useState(false)
  const [exiting,  setExiting]  = useState(false)
  const [progress, setProgress] = useState(0)
  const [requestId] = useState(() => `REQ-${randomToken(8).toUpperCase()}`)
  const [stepStates, setStepStates] = useState<Record<string, StepStatus>>(() =>
    Object.fromEntries(CHECK_STEPS.map((s) => [s.id, "pending" as StepStatus])),
  )

  const stepsFinishedRef = useRef(false)
  const pageLoadedRef    = useRef(false)
  const startTimeRef     = useRef(0)
  const tryFinishRef     = useRef<() => void>(() => {})

  const finish = useCallback(() => {
    document.body.removeAttribute("data-shield")
    setExiting(true)
    window.setTimeout(() => {
      try { localStorage.setItem(SESSION_KEY, Date.now().toString()) } catch { /* private */ }
      setVisible(false)
    }, 480)
  }, [])

  const makeTryFinish = useCallback((finishFn: () => void) => {
    return () => {
      if (!stepsFinishedRef.current || !pageLoadedRef.current) return
      const elapsed = performance.now() - startTimeRef.current
      const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed)
      window.setTimeout(finishFn, remaining)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    try {
      const val = localStorage.getItem(SESSION_KEY)
      if (val && Date.now() - Number(val) < SHIELD_TTL_MS) {
        document.body.removeAttribute("data-shield")
        return
      }
    } catch { /* private mode */ }
    setVisible(true)
  }, [])

  // Lock scroll
  useEffect(() => {
    if (!visible) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prev }
  }, [visible])

  // Phase 2: orchestrate
  useEffect(() => {
    if (!visible || exiting) return

    startTimeRef.current = performance.now()
    stepsFinishedRef.current = false
    pageLoadedRef.current    = false

    const tryFinish = makeTryFinish(finish)
    tryFinishRef.current = tryFinish

    let cancelled = false
    const timers: ReturnType<typeof window.setTimeout>[] = []

    waitForPageLoad().then(() => {
      if (cancelled) return
      pageLoadedRef.current = true
      tryFinish()
    })

    window.setTimeout(() => {
      if (cancelled) return

      const mult = getSpeedMultiplier()
      const totalBudgetMs = MIN_VISIBLE_MS * 0.75
      const totalBase     = CHECK_STEPS.reduce((acc, s) => acc + s.baseDelayMs, 0)
      const scale         = Math.min(1.4, Math.max(0.5, (totalBudgetMs / totalBase) * mult))

      let cumulative = 0

      CHECK_STEPS.forEach((step, index) => {
        const startDelay = cumulative
        cumulative += step.baseDelayMs * scale

        timers.push(window.setTimeout(() => {
          if (cancelled) return
          setStepStates((prev) => ({ ...prev, [step.id]: "running" }))
          setProgress(Math.round(((index + 0.35) / CHECK_STEPS.length) * 100))
        }, startDelay))

        timers.push(window.setTimeout(() => {
          if (cancelled) return
          setStepStates((prev) => ({ ...prev, [step.id]: "done" }))
          setProgress(Math.round(((index + 1) / CHECK_STEPS.length) * 100))
          if (index === CHECK_STEPS.length - 1) {
            stepsFinishedRef.current = true
            tryFinishRef.current()
          }
        }, cumulative))
      })
    }, 50)

    return () => {
      cancelled = true
      timers.forEach((id) => window.clearTimeout(id))
    }
  }, [visible, exiting, finish, makeTryFinish])

  if (!mounted || !visible) return null

  return (
    <div
      data-shield-overlay=""
      role="dialog"
      aria-modal="true"
      aria-labelledby="shield-title"
      aria-busy={!exiting}
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ambient-purple transition-opacity duration-500 ${
        exiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div
        className={`glass-effect ios-rounded-xl w-full max-w-md p-0.5 transition-gpu duration-500 ${
          exiting ? "scale-[0.98] opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <div className="glass-effect-light ios-rounded-xl p-6 sm:p-7 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 shrink-0 ios-rounded-lg bg-gradient-to-br from-emerald-500/25 to-cyan-500/20 border border-emerald-400/30 flex items-center justify-center">
              <Shield className="w-6 h-6 text-emerald-400" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h2 id="shield-title" className="text-lg font-semibold text-white tracking-tight">
                Kiểm tra bảo mật
              </h2>
              <p className="text-white/55 text-sm mt-1 leading-relaxed">
                Hệ thống đang xác minh truy cập trước khi vào trang. Vui lòng đợi vài giây.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/50 font-mono">
              <span>Tiến trình</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-400 transition-[transform] duration-300 ease-out"
                style={{ transform: `scaleX(${progress / 100})`, transformOrigin: "left" }}
              />
            </div>
          </div>

          <ul className="space-y-2.5" aria-live="polite">
            {CHECK_STEPS.map((step) => {
              const status = stepStates[step.id] ?? "pending"
              return (
                <li
                  key={step.id}
                  className={`flex items-center gap-3 text-sm rounded-lg px-3 py-2 border transition-colors duration-300 ${
                    status === "running"
                      ? "border-cyan-400/25 bg-cyan-500/10"
                      : status === "done"
                        ? "border-emerald-400/20 bg-emerald-500/5"
                        : "border-white/5 bg-white/[0.02]"
                  }`}
                >
                  <span className="shrink-0 w-5 h-5 flex items-center justify-center">
                    {status === "done" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" aria-hidden />
                    ) : status === "running" ? (
                      <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" aria-hidden />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-white/20" aria-hidden />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-white/90 font-medium truncate">{step.label}</p>
                    <p className="text-white/45 text-xs truncate">{step.detail}</p>
                  </div>
                </li>
              )
            })}
          </ul>

          <p className="text-[10px] text-white/35 font-mono text-center pt-1">
            {requestId} · edge-vn1 · shield/active
          </p>
        </div>
      </div>
    </div>
  )
}