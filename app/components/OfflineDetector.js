'use client'
import { useState, useEffect } from 'react'

export default function OfflineDetector() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    function handleOnline() {
      setIsOffline(false)
    }

    function handleOffline() {
      setIsOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    setIsOffline(!navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOffline) {
    return (
      <div className="fixed top-0 left-0 w-full bg-red-500 text-white p-2 text-center">
        Estás trabajando en modo offline
      </div>
    )
  }

  return null
} 