"use client"

import { useEffect, useState } from "react"

export interface GeolocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  error: string | null
  loading: boolean
}

export function useGeolocation(watch = false) {
  const [location, setLocation] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({
        latitude: null,
        longitude: null,
        accuracy: null,
        error: "Geolocation is not supported by your browser",
        loading: false,
      })
      return
    }

    const handleSuccess = (position: GeolocationPosition) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        error: null,
        loading: false,
      })
    }

    const handleError = (error: GeolocationPositionError) => {
      setLocation({
        latitude: null,
        longitude: null,
        accuracy: null,
        error: error.message,
        loading: false,
      })
    }

    if (watch) {
      const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      })

      return () => {
        navigator.geolocation.clearWatch(watchId)
      }
    } else {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      })
    }
  }, [watch])

  return location
}
