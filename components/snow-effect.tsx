"use client"
import React, { useState, useEffect, useMemo, memo } from 'react'

// Memoized Snowflake component for performance
const Snowflake = memo(({ style }: { style: React.CSSProperties }) => (
  <div className="snowflake" style={style} />
))
Snowflake.displayName = 'Snowflake'

const SnowEffect = memo(() => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const snowflakes = useMemo(() => {
    if (!isMounted) return []
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      style: {
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 10 + 8}s`,
        animationDelay: `${Math.random() * 3}s`,
        opacity: Math.random() * 0.5 + 0.3,
        fontSize: `${Math.random() * 5 + 2}px`,
      } as React.CSSProperties
    }))
  }, [isMounted])

  if (!isMounted) {
    return <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden" />
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
      {snowflakes.map((flake) => (
        <Snowflake key={flake.id} style={flake.style} />
      ))}
    </div>
  )
})
SnowEffect.displayName = 'SnowEffect'

export default SnowEffect
