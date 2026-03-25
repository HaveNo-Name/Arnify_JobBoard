import { Link } from 'react-router-dom'
import { formatSalary, timeAgo } from '../utils/helpers'

export default function JobCard({ job }) {
  return (
    <Link to={`/jobs/${job.id}`} className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition group">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition">{job.title}</h3>
          <p className="text-sm text-gray-500">{job.company} · {job.location}</p>
        </div>
        <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full shrink-0 ml-2">{job.type}</span>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{job.description}</p>

      <div className="flex flex-wrap gap-2 mb-3">
        {job.requirements?.slice(0, 3).map(r => (
          <span key={r} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{r}</span>
        ))}
        {job.requirements?.length > 3 && (
          <span className="text-xs text-gray-400">+{job.requirements.length - 3} more</span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className="font-medium text-gray-700">{formatSalary(job.salaryMin, job.salaryMax)}</span>
        <span>{timeAgo(job.createdAt)}</span>
      </div>
    </Link>
  )
}
