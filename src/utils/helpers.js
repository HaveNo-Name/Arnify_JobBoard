export const formatSalary = (min, max) => {
  const fmt = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString()}`
  return `${fmt(min)} – ${fmt(max)}`
}

export const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

export const STATUS_STYLES = {
  Pending:  'bg-blue-100 text-blue-700',
  Reviewed: 'bg-yellow-100 text-yellow-700',
  Accepted: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
}

export const CATEGORIES = ['All', 'Engineering', 'Design', 'Data', 'Marketing', 'Sales', 'Other']
export const JOB_TYPES  = ['Full-time', 'Part-time', 'Contract', 'Internship']
