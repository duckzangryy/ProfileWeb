"use client"
import React, { useState, useEffect, useLayoutEffect, useRef, memo } from 'react'
import { Cpu, Activity, Wifi } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

const TrendIndicator = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
  const configs = {
    up: { color: 'text-emerald-400', icon: '↑' },
    down: { color: 'text-red-400', icon: '↓' },
    stable: { color: 'text-white/40', icon: '–' }
  };

  const { color, icon } = configs[trend];
  return <span className={`${color} font-bold text-[10px]`}>{icon}</span>;
};

interface SpeedData {
  time: string
  download: number
  upload: number
  ping: number
}

const HISTORY_LENGTH = 8
const HISTORY_INTERVAL_MS = 10_000

function formatTimeLabel(date: Date) {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

/** Dữ liệu mẫu để biểu đồ hiển thị đủ đường ngay lần render đầu */
function buildSeedHistory(): {
  history: SpeedData[]
  download: number
  upload: number
  ping: number
} {
  const now = Date.now()
  const history: SpeedData[] = []
  let downloadBase = 22 + Math.random() * 12
  let uploadBase = 8 + Math.random() * 6
  let pingBase = 18 + Math.random() * 14

  for (let i = HISTORY_LENGTH - 1; i >= 0; i--) {
    downloadBase += (Math.random() - 0.5) * 3
    uploadBase += (Math.random() - 0.5) * 1.5
    pingBase += (Math.random() - 0.5) * 2
    downloadBase = Math.max(5, Math.min(50, downloadBase))
    uploadBase = Math.max(2, Math.min(20, uploadBase))
    pingBase = Math.max(5, Math.min(50, pingBase))

    const d = new Date(now - i * HISTORY_INTERVAL_MS)
    history.push({
      time: formatTimeLabel(d),
      download: Math.round(downloadBase * 10) / 10,
      upload: Math.round(uploadBase * 10) / 10,
      ping: Math.round(pingBase),
    })
  }

  const last = history[history.length - 1]!
  return {
    history,
    download: last.download,
    upload: last.upload,
    ping: last.ping,
  }
}

const NetworkLineChart = memo(({ history }: { history: SpeedData[] }) => {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null)

  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return

    const update = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      if (w > 0 && h > 0) setDims({ w, h })
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={wrapRef} className="h-28 sm:h-32 w-full min-h-[7rem]">
      {dims ? (
        <LineChart
          width={dims.w}
          height={dims.h}
          data={history}
          margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis
            dataKey="time"
            stroke="rgba(255,255,255,0.35)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            interval={history.length > 6 ? 2 : 0}
          />
          <YAxis
            stroke="rgba(255,255,255,0.35)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            domain={[0, 60]}
            ticks={[0, 15, 30, 45, 60]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(12, 8, 24, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '11px',
            }}
            labelStyle={{ color: '#fff' }}
            itemStyle={{ color: '#fff' }}
          />
          <Line
            type="monotone"
            dataKey="download"
            stroke="#34d399"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            connectNulls
            name="Download"
          />
          <Line
            type="monotone"
            dataKey="upload"
            stroke="#60a5fa"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            connectNulls
            name="Upload"
          />
        </LineChart>
      ) : (
        <div className="h-full w-full rounded-lg bg-white/[0.03] animate-pulse" aria-hidden />
      )}
    </div>
  )
})
NetworkLineChart.displayName = 'NetworkLineChart'

const SpeedChart = memo(({
  downloadSpeed = 0,
  uploadSpeed = 0,
  ping = 0,
  fps = 0,
  downloadTrend = 'stable' as 'up' | 'down' | 'stable',
  uploadTrend = 'stable' as 'up' | 'down' | 'stable',
  pingTrend = 'stable' as 'up' | 'down' | 'stable',
  history = [] as SpeedData[]
}: {
  downloadSpeed?: number;
  uploadSpeed?: number;
  ping?: number;
  fps?: number;
  downloadTrend?: 'up' | 'down' | 'stable';
  uploadTrend?: 'up' | 'down' | 'stable';
  pingTrend?: 'up' | 'down' | 'stable';
  history?: SpeedData[]
}) => {
  const maxSpeed = 120
  const safeDownload = downloadSpeed ?? 0
  const safeUpload = uploadSpeed ?? 0
  const safePing = ping ?? 0
  const safeFps = fps ?? 0

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-xs">
        <span className="text-white/60 flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 flex items-center justify-center">
            <Cpu className="w-3 h-3 text-yellow-400" />
          </div>
          <span>FPS</span>
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-yellow-400 font-mono font-medium text-sm">{safeFps}</span>
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/50" />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <div className="text-white/60 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
              <Activity className="w-3 h-3 text-emerald-400" />
            </div>
            <span>Download</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendIndicator trend={downloadTrend} />
            <span className="text-emerald-400 font-mono font-medium text-sm">{safeDownload.toFixed(1)} Mbps</span>
          </div>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full w-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-400 rounded-full bar-fill"
            style={{ transform: `scaleX(${Math.min(safeDownload / maxSpeed, 1)})` }}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <div className="text-white/60 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <Wifi className="w-3 h-3 text-blue-400" />
            </div>
            <span>Upload</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendIndicator trend={uploadTrend} />
            <span className="text-blue-400 font-mono font-medium text-sm">{safeUpload.toFixed(1)} Mbps</span>
          </div>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full w-full bg-gradient-to-r from-blue-500 via-purple-400 to-pink-400 rounded-full bar-fill"
            style={{ transform: `scaleX(${Math.min(safeUpload / maxSpeed, 1)})` }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center text-xs pt-2">
        <div className="text-white/50 flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-slate-500/20 to-slate-600/20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white/60" />
          </div>
          <span>Ping</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendIndicator trend={pingTrend} />
          <span className={`font-mono text-sm ${safePing < 20 ? 'text-emerald-400' : safePing < 50 ? 'text-yellow-400' : 'text-red-400'}`}>
            {safePing.toFixed(0)}ms
          </span>
        </div>
      </div>

      {/* Network Chart */}
      <div className="pt-3 border-t border-white/[0.08] shrink-0">
        <NetworkLineChart history={history} />
      </div>
    </div>
  )
})
SpeedChart.displayName = 'SpeedChart'

export const useFPS = () => {
  const [fps, setFps] = useState(0);
  const isActiveRef = useRef(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      isActiveRef.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = (timestamp: number) => {
      if (!isActiveRef.current) {
        animationId = requestAnimationFrame(measureFPS);
        return;
      }
      frameCount++;
      const elapsed = timestamp - lastTime;
      if (elapsed >= 1500) {
        setFps(Math.round((frameCount * 1000) / elapsed));
        frameCount = 0;
        lastTime = timestamp;
      }
      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return fps;
};

export const SpeedMonitor = memo(() => {
  const fps = useFPS();
  const seedRef = useRef<ReturnType<typeof buildSeedHistory> | null>(null)
  if (!seedRef.current) seedRef.current = buildSeedHistory()
  const seed = seedRef.current

  const [speedData, setSpeedData] = useState({
    download: seed.download,
    upload: seed.upload,
    ping: seed.ping,
    downloadTrend: 'stable' as 'up' | 'down' | 'stable',
    uploadTrend: 'stable' as 'up' | 'down' | 'stable',
    pingTrend: 'stable' as 'up' | 'down' | 'stable'
  });
  const [history, setHistory] = useState<SpeedData[]>(() => seed.history);

  const prevValuesRef = useRef({
    download: seed.download,
    upload: seed.upload,
    ping: seed.ping
  });

  useEffect(() => {
    let downloadBase = seed.download;
    let uploadBase = seed.upload;
    let pingBase = seed.ping;

    const updateSpeeds = () => {
      if (!document.hidden) {
        downloadBase += (Math.random() - 0.5) * 2;
        uploadBase += (Math.random() - 0.5) * 1;
        pingBase += (Math.random() - 0.5) * 0.5;

        downloadBase = Math.max(5, Math.min(50, downloadBase));
        uploadBase = Math.max(2, Math.min(20, uploadBase));
        pingBase = Math.max(5, Math.min(50, pingBase));

        const downloadTrend = downloadBase > prevValuesRef.current.download ? 'up' :
                           downloadBase < prevValuesRef.current.download ? 'down' : 'stable';
        const uploadTrend = uploadBase > prevValuesRef.current.upload ? 'up' :
                         uploadBase < prevValuesRef.current.upload ? 'down' : 'stable';
        const pingTrend = pingBase > prevValuesRef.current.ping ? 'up' :
                       pingBase < prevValuesRef.current.ping ? 'down' : 'stable';

        prevValuesRef.current = { download: downloadBase, upload: uploadBase, ping: pingBase };

        const time = formatTimeLabel(new Date())

        setSpeedData(prev => ({
          ...prev,
          download: Math.round(downloadBase * 10) / 10,
          upload: Math.round(uploadBase * 10) / 10,
          ping: Math.round(pingBase),
          downloadTrend,
          uploadTrend,
          pingTrend
        }));

        setHistory(prev => {
          const newHistory = [...prev, { time, download: downloadBase, upload: uploadBase, ping: pingBase }]
          return newHistory.slice(-HISTORY_LENGTH)
        })
      }
    };

    const interval = setInterval(updateSpeeds, HISTORY_INTERVAL_MS);
    return () => clearInterval(interval);
    // seed cố định lần mount — chỉ poll cập nhật sau đó
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SpeedChart
      downloadSpeed={speedData.download}
      uploadSpeed={speedData.upload}
      ping={speedData.ping}
      fps={fps}
      downloadTrend={speedData.downloadTrend}
      uploadTrend={speedData.uploadTrend}
      pingTrend={speedData.pingTrend}
      history={history}
    />
  )
})
SpeedMonitor.displayName = 'SpeedMonitor'

export default SpeedMonitor
