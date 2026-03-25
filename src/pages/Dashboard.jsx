import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectUser, selectRole } from '../features/authSlice'
import { useGetJobsQuery, useGetMyApplicationsQuery } from '../api/api'
import { STATUS_STYLES, timeAgo } from '../utils/helpers'
import Loader from '../components/Loader'

function StatCard({ label, value, color = 'text-indigo-600' }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

export default function Dashboard() {
  const user = useSelector(selectUser)
  const role = useSelector(selectRole)

  const { data: jobs = [], isLoading: jobsLoading } = useGetJobsQuery({})
  const { data: myApps = [], isLoading: appsLoading } = useGetMyApplicationsQuery(
    user?.id, { skip: !user || role !== 'applicant' }
  )

  const myJobs = jobs.filter(j => j.postedBy === user?.id)
  const isLoading = jobsLoading || appsLoading

  if (isLoading) return <div className="max-w-4xl mx-auto px-4 py-8"><Loader /></div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name} 👋</h1>
        <p className="text-gray-500 text-sm mt-1 capitalize">Signed in as <span className="font-medium text-indigo-600">{role}</span></p>
      </div>

      {/* ── APPLICANT ── */}
      {role === 'applicant' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total applied" value={myApps.length} />
            <StatCard label="Pending" value={myApps.filter(a => a.status === 'Pending').length} color="text-blue-600" />
            <StatCard label="Accepted" value={myApps.filter(a => a.status === 'Accepted').length} color="text-green-600" />
            <StatCard label="Rejected" value={myApps.filter(a => a.status === 'Rejected').length} color="text-red-500" />
          </div>

          <div className="flex gap-3 mb-8">
            <Link to="/jobs" className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
              Browse jobs
            </Link>
            <Link to="/applications" className="text-sm border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
              My applications →
            </Link>
          </div>

          {myApps.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-800 mb-3">Recent applications</h2>
              <div className="space-y-2">
                {myApps.slice(0, 4).map(app => (
                  <div key={app.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{app.jobTitle}</p>
                      <p className="text-xs text-gray-400">{app.company} · {timeAgo(app.appliedAt)}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[app.status]}`}>{app.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── RECRUITER ── */}
      {role === 'recruiter' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            <StatCard label="Jobs posted" value={myJobs.length} />
            <StatCard label="Total jobs" value={jobs.length} color="text-gray-700" />
          </div>

          <div className="flex gap-3 mb-8">
            <Link to="/jobs/new" className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
              Post a new job
            </Link>
            <Link to="/jobs" className="text-sm border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
              Browse all jobs
            </Link>
          </div>

          {myJobs.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-800 mb-3">Your job postings</h2>
              <div className="space-y-2">
                {myJobs.map(job => (
                  <div key={job.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{job.title}</p>
                      <p className="text-xs text-gray-400">{job.company} · {timeAgo(job.createdAt)}</p>
                    </div>
                    <Link to={`/jobs/${job.id}`} className="text-xs text-indigo-600 hover:underline">View →</Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── ADMIN ── */}
      {role === 'admin' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            <StatCard label="Total jobs" value={jobs.length} />
          </div>
          <div className="flex gap-3">
            <Link to="/admin" className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
              Admin panel →
            </Link>
            <Link to="/jobs/new" className="text-sm border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
              Post a job
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
