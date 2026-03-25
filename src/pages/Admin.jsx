import { useState } from 'react'
import { useGetAllUsersQuery, useGetJobsQuery, useUpdateUserRoleMutation } from '../api/api'
import Loader from '../components/Loader'
import ErrorState from '../components/ErrorState'
import { timeAgo } from '../utils/helpers'
import toast from 'react-hot-toast'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

const TABS = ['Overview', 'Users', 'Jobs']
const PIE_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444']

export default function Admin() {
  const [tab, setTab] = useState('Overview')

  const { data: users = [], isLoading: usersLoading, isError: usersError } = useGetAllUsersQuery()
  const { data: jobs = [], isLoading: jobsLoading } = useGetJobsQuery({})
  const [updateRole] = useUpdateUserRoleMutation()

  const isLoading = usersLoading || jobsLoading

  // Analytics data
  const apps = JSON.parse(localStorage.getItem('applications') || '[]')

  const jobsByCategory = Object.entries(
    jobs.reduce((acc, j) => { acc[j.category] = (acc[j.category] || 0) + 1; return acc }, {})
  ).map(([name, count]) => ({ name, count }))

  const appsByStatus = ['Pending', 'Reviewed', 'Accepted', 'Rejected'].map(status => ({
    name: status,
    value: apps.filter(a => a.status === status).length,
  })).filter(d => d.value > 0)

  const handleRoleChange = async (userId, role) => {
    try {
      await updateRole({ userId, role }).unwrap()
      toast.success('Role updated')
    } catch {
      toast.error('Failed to update role')
    }
  }

  if (isLoading) return <div className="max-w-5xl mx-auto px-4 py-8"><Loader /></div>
  if (usersError) return <div className="max-w-5xl mx-auto px-4 py-8"><ErrorState /></div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 w-fit">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'Overview' && (
        <div className="space-y-8">
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total users', value: users.length, color: 'text-indigo-600' },
              { label: 'Total jobs', value: jobs.length, color: 'text-teal-600' },
              { label: 'Applications', value: apps.length, color: 'text-amber-600' },
              { label: 'Accepted', value: apps.filter(a => a.status === 'Accepted').length, color: 'text-green-600' },
            ].map(s => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-sm text-gray-500 mb-1">{s.label}</p>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Jobs by category</h3>
              {jobsByCategory.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={jobsByCategory}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Application status breakdown</h3>
              {appsByStatus.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No applications yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={appsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {appsByStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── USERS ── */}
      {tab === 'Users' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Name', 'Email', 'Role', 'Change role'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                      u.role === 'admin' ? 'bg-red-100 text-red-700'
                      : u.role === 'recruiter' ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-100 text-gray-600'
                    }`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white outline-none"
                    >
                      {['applicant', 'recruiter', 'admin'].map(r => <option key={r}>{r}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── JOBS ── */}
      {tab === 'Jobs' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Title', 'Company', 'Category', 'Posted by', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {jobs.map(j => (
                <tr key={j.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{j.title}</td>
                  <td className="px-4 py-3 text-gray-500">{j.company}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{j.category}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{j.postedByName}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{timeAgo(j.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
