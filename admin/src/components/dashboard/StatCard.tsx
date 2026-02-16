import { Link } from 'react-router-dom'

interface StatCardProps {
  readonly label: string
  readonly value: number
  readonly highlight?: boolean
  readonly linkTo?: string
}

export function StatCard({ label, value, highlight = false, linkTo }: StatCardProps) {
  const baseClasses = 'rounded-lg border p-4'
  const colorClasses = highlight
    ? 'border-amber-300 bg-amber-50'
    : 'border-gray-200 bg-white'

  const content = (
    <div className={`${baseClasses} ${colorClasses}`}>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  )

  if (linkTo) {
    return <Link to={linkTo}>{content}</Link>
  }

  return content
}
