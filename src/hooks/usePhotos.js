import { useEffect, useRef, useState } from 'react'
import { addPhoto, getPhotosByBaby, deletePhoto } from '../utils/photoDb'

export function usePhotos(babyId) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const photosRef = useRef([])

  useEffect(() => {
    photosRef.current = photos
  }, [photos])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getPhotosByBaby(babyId).then((records) => {
      if (cancelled) return
      setPhotos(records.map((r) => ({ ...r, url: URL.createObjectURL(r.blob) })))
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [babyId])

  useEffect(() => {
    return () => {
      photosRef.current.forEach((p) => URL.revokeObjectURL(p.url))
    }
  }, [])

  async function add(photo, file) {
    await addPhoto(photo)
    setPhotos((prev) => [...prev, { ...photo, url: URL.createObjectURL(file) }])
  }

  async function remove(id) {
    const photo = photosRef.current.find((p) => p.id === id)
    await deletePhoto(id)
    if (photo) URL.revokeObjectURL(photo.url)
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  return { photos, loading, add, remove }
}
