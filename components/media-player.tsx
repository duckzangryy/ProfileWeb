"use client"
import React, { useState, useEffect, useRef, useCallback, memo } from 'react'
import Image from "next/image"
import { 
  Play, Pause, SkipBack, SkipForward, Repeat, Shuffle
} from "lucide-react"

const playlist = [
  { 
    title: "Tuyệt Tình Ca ", 
    artist: "Lã Phong Lâm", 
    cover: "/artworks-R45YFyvPI2wxXPkP-PUX69g-t500x500.jpg",
    audioUrl: "/TuyetTinhCa.mp3"
  },
  { 
    title: "Em Đau Rồi Đấy", 
    artist: "Dương Yến Phi", 
    cover: "/artworks-W3QPrHejdf5xxyUn-C5HjGw-t500x500.jpg",
    audioUrl: "/EmDauRoiDay.mp3"
  },
  { 
    title: "Chân Tình", 
    artist: "Vân Trường", 
    cover: "/artworks-xfUvU2QmwI7o27Gk-RQgr5A-t500x500.jpg",
    audioUrl: "/ChanTinh.mp3"
  },
  { 
    title: "Ngưng Làm Bạn", 
    artist: "TINO, Hoàng Yến Chibi", 
    cover: "/artworks-8JJH3iXv3xBIE9Ih-vjWrkg-t500x500.jpg",
    audioUrl: "/NgungLamBan.mp3"
  },
  { 
    title: "Dấu Yêu", 
    artist: "Mỹ Tâm", 
    cover: "/artworks-lH7QiVsN8ZGKs3rm-sx4opA-t500x500.jpg",
    audioUrl: "/DauYeu.mp3"
  },
]

const MediaPlayer = memo(() => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [trackDuration, setTrackDuration] = useState("0:00")
  const [isShuffle, setIsShuffle] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio();
    audio.volume = 1
    audio.preload = "none" // Defer loading
    audioRef.current = audio

    const handleTimeUpdate = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setProgress((audio.currentTime / audio.duration) * 100)
        setCurrentTime(audio.currentTime)
      }
    }

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setTrackDuration(formatTime(audio.duration))
      }
    }

    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0
        audio.play().catch(() => {})
      } else {
        nextTrack()
      }
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [isRepeat])

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current
      const wasPlaying = isPlaying

      audio.src = playlist[currentTrack].audioUrl
      // Don't call load() immediately to save bandwidth unless playing
      if (wasPlaying) {
        audio.load()
        audio.play().then(() => {
          setIsPlaying(true)
        }).catch(() => {
          setIsPlaying(false)
        })
      }
      setProgress(0)
      setCurrentTime(0)
      setTrackDuration("0:00")
    }
  }, [currentTrack])

  const togglePlay = useCallback(async () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        try {
          if (!audioRef.current.src) {
             audioRef.current.src = playlist[currentTrack].audioUrl
             audioRef.current.load()
          }
          await audioRef.current.play()
          setIsPlaying(true)
        } catch (e) {
          console.log("Play failed:", e)
        }
      }
    }
  }, [isPlaying, currentTrack])

  const nextTrack = useCallback(() => {
    setCurrentTrack((prev) => {
      if (isShuffle) {
        return Math.floor(Math.random() * playlist.length)
      }
      return (prev + 1) % playlist.length
    })
  }, [isShuffle])

  const prevTrack = useCallback(() => {
    setCurrentTrack((prev) => (prev - 1 + playlist.length) % playlist.length)
  }, [])

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && audioRef.current.duration) {
      const rect = e.currentTarget.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      audioRef.current.currentTime = percent * audioRef.current.duration
    }
  }

  return (
    <div className={`media-player-root flex flex-col gap-3 ${isPlaying ? 'playing' : ''}`}>
      <div className="shrink-0 space-y-3">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 flex-shrink-0 relative group">
            <div className="absolute inset-0 rounded-full overflow-hidden border border-white/20 shadow-xl shadow-black/40">
              <div className={`absolute inset-0 rounded-full overflow-hidden gpu-smooth ${isPlaying ? 'animate-spin-slow' : ''}`}>
                <Image
                  src={playlist[currentTrack].cover}
                  alt={playlist[currentTrack].title}
                  fill
                  className="object-cover rounded-full"
                  sizes="80px"
                  quality={70}
                />
                <div className="absolute inset-0 rounded-full border border-black/10 pointer-events-none" />
                <div className="absolute inset-6 rounded-full bg-slate-950/80 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-inner">
                  <div className="w-2 h-2 rounded-full bg-slate-900 border border-white/30" />
                </div>
              </div>
            </div>
            {isPlaying && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1 h-3 items-end">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-1 h-2 bg-gradient-to-t from-emerald-400 via-cyan-400 to-blue-400 rounded-full animate-equalizer"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <div className="space-y-1">
              <h3 className="text-white font-bold text-lg truncate drop-shadow-lg">{playlist[currentTrack].title}</h3>
              <p className="text-white/70 text-sm truncate font-medium">{playlist[currentTrack].artist}</p>
            </div>
            <div className="flex items-center gap-2.5 mt-1">
              <div className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 animate-pulse' : 'bg-white/50'}`} />
              <span className={`text-xs font-medium ${isPlaying ? 'text-emerald-300' : 'text-white/60'}`}>
                {isPlaying ? 'ĐANG PHÁT' : 'TẠM DỪNG'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer group backdrop-blur-sm border border-white/5" onClick={handleProgressClick}>
            <div
              className="h-full w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 rounded-full bar-fill"
              style={{ transform: `scaleX(${progress / 100})` }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-white/60 font-mono font-medium">{formatTime(currentTime)}</span>
            <span className="text-xs text-white/60 font-mono font-medium">{trackDuration}</span>
          </div>
        </div>
      </div>

      <div className="shrink-0 flex items-center justify-center gap-4 lg:gap-5">
          <button onClick={() => setIsShuffle(!isShuffle)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm border ${isShuffle ? 'text-cyan-300 bg-cyan-500/20 border-cyan-500/40' : 'text-white/80 bg-white/5 border-white/15'}`}>
            <Shuffle className="h-4 w-4" />
          </button>
          <button onClick={prevTrack} className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 bg-white/5 border border-white/15">
            <SkipBack className="h-4 w-4" />
          </button>
          <button onClick={togglePlay} className="w-14 h-14 rounded-full flex items-center justify-center bg-white/10 border border-white/20 backdrop-blur-xl">
            {isPlaying ? <Pause className="h-5 w-5 text-white" /> : <Play className="h-5 w-5 text-white ml-0.5" />}
          </button>
          <button onClick={nextTrack} className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 bg-white/5 border border-white/15">
            <SkipForward className="h-4 w-4" />
          </button>
          <button onClick={() => setIsRepeat(!isRepeat)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-gpu border ${isRepeat ? 'text-cyan-300 bg-cyan-500/20 border-cyan-500/40' : 'text-white/80 bg-white/5 border-white/15'}`}>
            <Repeat className="h-4 w-4" />
          </button>
        </div>

      <div className="playlist-wrap pt-3 border-t border-white/10">
          <div className="playlist-list space-y-2 overscroll-y-contain">
            {playlist.map((track, index) => (
              <button key={index} onClick={() => setCurrentTrack(index)} className={`w-full min-h-[3.25rem] flex items-center justify-between p-3 rounded-lg transition-gpu border ${index === currentTrack ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/15 text-cyan-300 border-cyan-500/30' : 'bg-white/5 text-white/60 border-white/10'}`}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${index === currentTrack ? 'bg-cyan-500/30 text-cyan-300' : 'bg-white/10 text-white/50'}`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className={`text-sm font-medium truncate ${index === currentTrack ? 'text-cyan-300' : 'text-white/80'}`}>{track.title}</div>
                    <div className="text-xs text-white/50 truncate">{track.artist}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
      </div>
    </div>
  )
})
MediaPlayer.displayName = 'MediaPlayer'

export default MediaPlayer
