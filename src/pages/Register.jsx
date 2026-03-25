import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useRegisterMutation } from '../api/api'
import { setCredentials } from '../features/authSlice'
import toast from 'react-hot-toast'

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [register, { isLoading }] = useRegisterMutation()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: '' })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'At least 6 characters'
    if (!form.confirm) e.confirm = 'Please confirm your password'
    else if (form.confirm !== form.password) e.confirm = 'Passwords do not match'
    if (!form.role) e.role = 'Please select a role'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) return setErrors(errs)
    setErrors({})
    try {
      const result = await register({ name: form.name, email: form.email, password: form.password, role: form.role }).unwrap()
      dispatch(setCredentials(result))
      toast.success('Account created! Welcome aboard.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err?.data || 'Registration failed')
    }
  }

  const field = (id) => ({
    value: form[id],
    onChange: (e) => setForm(f => ({ ...f, [id]: e.target.value })),
    className: `w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition ${errors[id] ? 'border-red-400' : 'border-gray-300'}`,
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md">

        <h1 className="text-2xl font-bold text-gray-800 mb-1">Create account</h1>
        <p className="text-sm text-gray-500 mb-6">Join JobBoard today</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Full name</label>
            <input type="text" placeholder="Jane Doe" {...field('name')} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
            <input type="text" placeholder="you@example.com" {...field('email')} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
            <input type="password" placeholder="Min 6 characters" {...field('password')} />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Confirm password</label>
            <input type="password" placeholder="Repeat password" {...field('confirm')} />
            {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              {['applicant', 'recruiter'].map(r => (
                <button
                  key={r} type="button"
                  onClick={() => setForm(f => ({ ...f, role: r }))}
                  className={`py-2.5 rounded-xl border text-sm font-medium capitalize transition ${
                    form.role === r
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-300 text-gray-600 hover:border-indigo-300'
                  }`}
                >
                  {r === 'applicant' ? '🙋 Job Seeker' : '🏢 Recruiter'}
                </button>
              ))}
            </div>
            {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
          </div>

          <button
            type="submit" disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition mt-2"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
