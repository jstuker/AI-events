interface FormFieldProps {
  readonly label: string
  readonly value: string
  readonly error?: string
  readonly className?: string
}

export function FormField({ label, value, error, className = '' }: FormFieldProps) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value || '—'}</dd>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
