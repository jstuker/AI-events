import { useState, useRef } from 'react'
import type { EventFormData, ValidationErrors } from '../../../types/event-form'
import { uploadEventImage, previewUrl } from '../../../services/image-upload-service'

interface ImageSectionProps {
  readonly formData: EventFormData
  readonly errors?: ValidationErrors
  readonly setField: (field: string, value: unknown) => void
  readonly eventId: string
  readonly token: string
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

interface ImageFieldProps {
  readonly label: string
  readonly fieldName: string
  readonly imageType: '1x1' | '16x9'
  readonly currentPath: string
  readonly error?: string
  readonly eventId: string
  readonly token: string
  readonly onPathChange: (path: string) => void
}

function ImageField({ label, fieldName, imageType, currentPath, error, eventId, token, onPathChange }: ImageFieldProps) {
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [uploadError, setUploadError] = useState('')
  const [previewBroken, setPreviewBroken] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setStatus('uploading')
    setUploadError('')
    setPreviewBroken(false)
    try {
      const result = await uploadEventImage(file, token, eventId, imageType)
      onPathChange(result.path)
      setStatus('success')
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
      setStatus('error')
    }

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div>
      <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700">{label}</label>

      <input
        ref={inputRef}
        id={fieldName}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={status === 'uploading'}
        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      {status === 'uploading' && (
        <p className="mt-1 text-xs text-blue-600">Uploading...</p>
      )}
      {status === 'success' && (
        <p className="mt-1 text-xs text-green-600">Uploaded successfully</p>
      )}
      {status === 'error' && uploadError && (
        <p className="mt-1 text-xs text-red-600">{uploadError}</p>
      )}

      {currentPath && (
        <p className="mt-1 text-xs text-gray-500 truncate" title={currentPath}>{currentPath}</p>
      )}

      {currentPath && !previewBroken && (
        <img
          src={previewUrl(currentPath)}
          alt={`${label} preview`}
          className="mt-2 max-h-[120px] rounded border border-gray-200"
          loading="lazy"
          onError={() => setPreviewBroken(true)}
        />
      )}

      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}

export function ImageSection({ formData, errors, setField, eventId, token }: ImageSectionProps) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-semibold text-gray-700 mb-2">Images</legend>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ImageField
          label="Image 1:1 (Square)"
          fieldName="event_image_1x1"
          imageType="1x1"
          currentPath={formData.event_image_1x1}
          error={errors?.event_image_1x1}
          eventId={eventId}
          token={token}
          onPathChange={(path) => setField('event_image_1x1', path)}
        />
        <ImageField
          label="Image 16:9 (Widescreen)"
          fieldName="event_image_16x9"
          imageType="16x9"
          currentPath={formData.event_image_16x9}
          error={errors?.event_image_16x9}
          eventId={eventId}
          token={token}
          onPathChange={(path) => setField('event_image_16x9', path)}
        />
      </div>
    </fieldset>
  )
}
