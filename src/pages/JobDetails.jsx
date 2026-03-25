import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  useGetJobByIdQuery,
  useDeleteJobMutation,
  useApplyToJobMutation,
  useGetMyApplicationsQuery,
  useGetJobApplicantsQuery,
  useUpdateAppStatusMutation,
} from '../api/api'
import { selectUser, selectRole } from '../features/authSlice'
import Loader from '../components/Loader'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import { formatSalary, timeAgo, STATUS_STYLES } from '../utils/helpers'
import toast from 'react-hot-toast'

function ApplyModal({ job, onClose }) {
  const user = useSelector(selectUser)
  const [coverNote, setCoverNote] = useState('')
  const [apply, { isLoading }] = useApplyToJobMutation()

  const handleApply = async () => {
    try {
      await apply({
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        userId: user.id,
        userName: user.name,
        coverNote,
      }).unwrap()
      toast.success('Application submitted!')
      onClose()
    } catch (err) {
      toast.error(err?.data || 'Could not submit application')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-lg font-bold text-gray-800 mb-1">Apply for {job.title}</h2>
        <p className="text-sm text-gray-500 mb-4">{job.company} · {job.location}</p>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Cover note <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={coverNote}
          onChange={e => setCoverNote(e.target.value)}
          rows={4}
          placeholder="Briefly introduce yourself and why you're a great fit..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
        />
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
            Cancel
          </button>
          <button
            onClick={handleApply} disabled={isLoading}
            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-60 transition"
          >
            {isLoading ? 'Submitting...' : 'Submit application'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ApplicantsList({ jobId }) {
  const { data: applicants = [], isLoading } = useGetJobApplicantsQuery(jobId)
  const [updateStatus] = useUpdateAppStatusMutation()

  if (isLoading) return <Loader />
  if (!applicants.length) return (
    <EmptyState title="No applicants yet" message="Applications will appear here once candidates apply." />
  )

  const handleStatus = async (appId, status) => {
    try {
      await updateStatus({ appId, status }).unwrap()
      toast.success(`Status updated to ${status}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Applicants ({applicants.length})</h2>
      <div className="space-y-3">
        {applicants.map(app => (
          <div key={app.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="font-medium text-gray-800">{app.userName}</p>
              {app.coverNote && <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{app.coverNote}</p>}
              <p className="text-xs text-gray-400 mt-1">Applied {timeAgo(app.appliedAt)}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[app.status]}`}>{app.status}</span>
              <select
                value={app.status}
                onChange={e => handleStatus(app.id, e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white outline-none"
              >
                {['Pending', 'Reviewed', 'Accepted', 'Rejected'].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function JobDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  const role = useSelector(selectRole)
  const [showModal, setShowModal] = useState(false)

  const { data: job, isLoading, isError } = useGetJobByIdQuery(id)
  const { data: myApps = [] } = useGetMyApplicationsQuery(user?.id, { skip: !user || role !== 'applicant' })
  const [deleteJob, { isLoading: isDeleting }] = useDeleteJobMutation()

  const alreadyApplied = myApps.some(a => a.jobId === id)
  const isOwner = job?.postedBy === user?.id
  const canEdit = (role === 'recruiter' && isOwner) || role === 'admin'

  const handleDelete = async () => {
    if (!confirm('Delete this job? This cannot be undone.')) return
    try {
      await deleteJob(id).unwrap()
      toast.success('Job deleted')
      navigate('/jobs')
    } catch {
      toast.error('Failed to delete job')
    }
  }

  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-8"><Loader /></div>
  if (isError || !job) return <div className="max-w-3xl mx-auto px-4 py-8"><ErrorState message="Job not found or could not be loaded." /></div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {showModal && <ApplyModal job={job} onClose={() => setShowModal(false)} />}

      <Link to="/jobs" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">← Back to jobs</Link>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h1>
            <p className="text-gray-600">{job.company} · {job.location}</p>
          </div>
          <span className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full shrink-0">{job.type}</span>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 mb-5 text-sm">
          <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">
            {formatSalary(job.salaryMin, job.salaryMax)}
          </span>
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{job.category}</span>
          <span className="text-gray-400 text-xs self-center">Posted {timeAgo(job.createdAt)}</span>
        </div>

        {/* Description */}
        <div className="mb-5">
          <h2 className="font-semibold text-gray-800 mb-2">About the role</h2>
          <p className="text-gray-600 text-sm leading-relaxed">{job.description}</p>
        </div>

        {/* Requirements */}
        {job.requirements?.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold text-gray-800 mb-2">Requirements</h2>
            <div className="flex flex-wrap gap-2">
              {job.requirements.map(r => (
                <span key={r} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{r}</span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 flex-wrap border-t border-gray-100 pt-5">
          {role === 'applicant' && (
            alreadyApplied ? (
              <span className="bg-green-100 text-green-700 px-5 py-2.5 rounded-lg text-sm font-medium">
                Applied ✓
              </span>
            ) : (
              <button
                onClick={() => user ? setShowModal(true) : navigate('/login')}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
              >
                Apply now
              </button>
            )
          )}

          {!user && (
            <button
              onClick={() => navigate('/login')}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              Login to apply
            </button>
          )}

          {canEdit && (
            <>
              <Link
                to={`/jobs/${id}/edit`}
                className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                Edit job
              </Link>
              <button
                onClick={handleDelete} disabled={isDeleting}
                className="border border-red-200 text-red-500 px-5 py-2.5 rounded-lg text-sm hover:bg-red-50 disabled:opacity-60 transition"
              >
                {isDeleting ? 'Deleting...' : 'Delete job'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Applicants section for recruiter/admin */}
      {canEdit && <ApplicantsList jobId={id} />}
    </div>
  )
}
