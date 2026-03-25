import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useCreateJobMutation, useUpdateJobMutation, useGetJobByIdQuery } from '../api/api'
import { selectUser, selectRole } from '../features/authSlice'
import Loader from '../components/Loader'
import { CATEGORIES, JOB_TYPES } from '../utils/helpers'
import toast from 'react-hot-toast'

const empty = { title: '', company: '', location: '', category: '', type: '', salaryMin: '', salaryMax: '', description: '', requirements: '' }

export default function JobForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  const role = useSelector(selectRole)

  const { data: existing, isLoading: loadingJob } = useGetJobByIdQuery(id, { skip: !isEdit })
  const [createJob, { isLoading: creating }] = useCreateJobMutation()
  const [updateJob, { isLoading: updating }] = useUpdateJobMutation()

  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (existing && isEdit) {
      setForm({
        title: existing.title,
        company: existing.company,
        location: existing.location,
        category: existing.category,
        type: existing.type,
        salaryMin: existing.salaryMin,
        salaryMax: existing.salaryMax,
        description: existing.description,
        requirements: existing.requirements?.join(', ') || '',
      })
    }
  }, [existing, isEdit])

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Job title is required'
    if (!form.company.trim()) e.company = 'Company is required'
    if (!form.location.trim()) e.location = 'Location is required'
    if (!form.category) e.category = 'Select a category'
    if (!form.type) e.type = 'Select job type'
    if (!form.salaryMin) e.salaryMin = 'Minimum salary required'
    if (!form.salaryMax) e.salaryMax = 'Maximum salary required'
    if (Number(form.salaryMin) >= Number(form.salaryMax)) e.salaryMax = 'Max must be greater than min'
    if (!form.description.trim()) e.description = 'Description is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) return setErrors(errs)
    setErrors({})

    const payload = {
      ...form,
      salaryMin: Number(form.salaryMin),
      salaryMax: Number(form.salaryMax),
      requirements: form.requirements.split(',').map(r => r.trim()).filter(Boolean),
      postedBy: user.id,
      postedByName: user.name,
    }

    try {
      if (isEdit) {
        await updateJob({ id, ...payload }).unwrap()
        toast.success('Job updated successfully')
        navigate(`/jobs/${id}`)
      } else {
        const result = await createJob(payload).unwrap()
        toast.success('Job posted successfully')
        navigate(`/jobs/${result.id}`)
      }
    } catch {
      toast.error('Failed to save job')
    }
  }

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))
  const inputClass = (key) =>
    `w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition ${errors[key] ? 'border-red-400' : 'border-gray-300'}`

  if (isEdit && loadingJob) return <div className="max-w-2xl mx-auto px-4 py-8"><Loader /></div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">{isEdit ? 'Edit job' : 'Post a new job'}</h1>
      <p className="text-sm text-gray-500 mb-6">{isEdit ? 'Update the job details below.' : 'Fill in the details to post a job listing.'}</p>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Job title *</label>
            <input value={form.title} onChange={set('title')} placeholder="e.g. Frontend Developer" className={inputClass('title')} />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Company *</label>
            <input value={form.company} onChange={set('company')} placeholder="e.g. Acme Corp" className={inputClass('company')} />
            {errors.company && <p className="text-xs text-red-500 mt-1">{errors.company}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Location *</label>
            <input value={form.location} onChange={set('location')} placeholder="e.g. Bangalore / Remote" className={inputClass('location')} />
            {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Category *</label>
            <select value={form.category} onChange={set('category')} className={inputClass('category')}>
              <option value="">Select category</option>
              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Job type *</label>
            <select value={form.type} onChange={set('type')} className={inputClass('type')}>
              <option value="">Select type</option>
              {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Min salary (₹) *</label>
            <input type="number" value={form.salaryMin} onChange={set('salaryMin')} placeholder="600000" className={inputClass('salaryMin')} />
            {errors.salaryMin && <p className="text-xs text-red-500 mt-1">{errors.salaryMin}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Max salary (₹) *</label>
            <input type="number" value={form.salaryMax} onChange={set('salaryMax')} placeholder="1000000" className={inputClass('salaryMax')} />
            {errors.salaryMax && <p className="text-xs text-red-500 mt-1">{errors.salaryMax}</p>}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Description *</label>
          <textarea value={form.description} onChange={set('description')} rows={4} placeholder="Describe the role, responsibilities, and what you're looking for..." className={`${inputClass('description')} resize-none`} />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Requirements <span className="text-gray-400 font-normal">(comma separated)</span>
          </label>
          <input value={form.requirements} onChange={set('requirements')} placeholder="React, TypeScript, Node.js" className={inputClass('requirements')} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition">
            Cancel
          </button>
          <button
            type="submit" disabled={creating || updating}
            className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition"
          >
            {creating || updating ? 'Saving...' : isEdit ? 'Save changes' : 'Post job'}
          </button>
        </div>
      </form>
    </div>
  )
}
