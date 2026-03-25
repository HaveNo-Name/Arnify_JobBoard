import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useGetJobsQuery } from '../api/api'
import JobCard from '../components/JobCard'
import { SkeletonCard } from '../components/Loader'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import { CATEGORIES } from '../utils/helpers'

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [inputVal, setInputVal] = useState(searchParams.get('q') || '')

  const search = searchParams.get('q') || ''
  const category = searchParams.get('category') || 'All'
  const sort = searchParams.get('sort') || 'newest'

  // Debounce search → URL
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev)
        if (inputVal) next.set('q', inputVal); else next.delete('q')
        return next
      }, { replace: true })
    }, 300)
    return () => clearTimeout(t)
  }, [inputVal])

  const { data: jobs = [], isLoading, isError, error } = useGetJobsQuery({ search, category, sort })

  const setFilter = (key, val) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (val && val !== 'All' && val !== 'newest') next.set(key, val)
      else next.delete(key)
      return next
    }, { replace: true })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Browse Jobs</h1>
        <p className="text-gray-500 text-sm">{jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by title, company, location..."
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition"
        />
        <select
          value={category}
          onChange={e => setFilter('category', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        >
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select
          value={sort}
          onChange={e => setFilter('sort', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        >
          <option value="newest">Newest first</option>
          <option value="salary">Highest salary</option>
        </select>
      </div>

      {/* States */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {isError && <ErrorState message={error?.data || 'Could not load jobs. Please try again.'} />}

      {!isLoading && !isError && jobs.length === 0 && (
        <EmptyState
          title="No jobs found"
          message={search ? `No results for "${search}". Try a different search term.` : 'No jobs available right now. Check back soon.'}
          action={search ? { label: 'Clear search', onClick: () => { setInputVal(''); setSearchParams({}) } } : null}
        />
      )}

      {!isLoading && !isError && jobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map(job => <JobCard key={job.id} job={job} />)}
        </div>
      )}
    </div>
  )
}
