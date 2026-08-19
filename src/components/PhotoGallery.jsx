import { useState } from 'react'
import { labelForPhoto } from '../utils/photoLabel'

function PhotoGallery({ photos, onDelete }) {
  const [lightboxId, setLightboxId] = useState(null)
  const lightboxPhoto = photos.find((p) => p.id === lightboxId) ?? null

  return (
    <>
      <div className="photo-grid">
        {photos.map((photo) => (
          <button key={photo.id} type="button" className="photo-card" onClick={() => setLightboxId(photo.id)}>
            <img src={photo.url} alt={photo.caption || labelForPhoto(photo)} className="photo-thumb" />
            {photo.caption && <span className="photo-user-caption">{photo.caption}</span>}
            <span className="photo-meta">{labelForPhoto(photo)}</span>
          </button>
        ))}
      </div>

      {lightboxPhoto && (
        <div className="photo-lightbox" onClick={() => setLightboxId(null)}>
          <div className="photo-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxPhoto.url} alt={lightboxPhoto.caption || labelForPhoto(lightboxPhoto)} />
            <div className="photo-lightbox-footer">
              <div className="photo-lightbox-text">
                {lightboxPhoto.caption && <strong className="photo-user-caption">{lightboxPhoto.caption}</strong>}
                <span className="photo-meta">{labelForPhoto(lightboxPhoto)}</span>
              </div>
              <div className="photo-lightbox-actions">
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    onDelete(lightboxPhoto.id)
                    setLightboxId(null)
                  }}
                >
                  Delete
                </button>
                <button type="button" className="ghost-button" onClick={() => setLightboxId(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PhotoGallery
