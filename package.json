import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useGetMyApplicationsQuery, useWithdrawApplicationMutation } from '../api/api'
import { selectUser } from '../features/authSlice'
import Loader from '../components/Loader'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import { STATUS_STYLES, timeAgo } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function MyApplications() {
  const user = useSelector(selectUser)
  const { data: apps = [], isLoading, isError } = useGetMyApplicationsQuery(user?.id)
  const [withdraw, { isLoading: withdrawing }] = useWithdrawApplicationMutation()

  const handleWithdraw = async (appId) => {
    if (!confirm('Withdraw this application?')) return
    try {
      await withdraw(appId).unwrap()
      toast.success('Application withdrawn')
    } catch {
      toast.error('Failed to withdraw')
    }
  }

  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-8"><Loader /></div>
  if (isError) return <div className="max-w-3xl mx-auto px-4 py-8"><ErrorState message="Could not load your applications." /></div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-sm text-gray-500 mt-1">{apps.length} application{apps.length !== 1 ? 's' : ''}</p>
      </div>

      {apps.length === 0 && (
        <EmptyState
          title="No applications yet"
          message="You haven't applied to any jobs. Start browsing to find your next opportunity."
          action={{ label: 'Browse jobs', onClick: () => window.location.href = '/jobs' }}
        />
      )}

      <div className="space-y-3">
        {apps.map(app => (
          <div key={app.id} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <Link to={`/jobs/${app.jobId}`} className="font-semibold text-gray-900 hover:text-indigo-600 transition">
                  {app.jobTitle}
                </Link>
                <p className="text-sm text-gray-500 mt-0.5">{app.company}</p>
                {app.coverNote && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2 italic">"{app.coverNote}"</p>
                )}
                <p className="text-xs text-gray-400 mt-2">Applied {timeAgo(app.appliedAt)}</p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_STYLES[app.status]}`}>
                  {app.status}
                </span>
                {app.status === 'Pending' && (
                  <button
                    onClick={() => handleWithdraw(app.id)}
                    disabled={withdrawing}
                    className="text-xs text-red-400 hover:text-red-600 transition disabled:opacity-50"
                  >
                    Withdraw
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
