import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout, selectUser, selectRole } from '../features/authSlice'
import toast from 'react-hot-toast'

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useSelector(selectUser)
  const role = useSelector(selectRole)

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path
    ? 'text-indigo-600 font-medium'
    : 'text-gray-600 hover:text-indigo-600'

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">

        <div className="flex items-center gap-8">
          <Link to="/jobs" className="text-xl font-bold text-indigo-600">JobBoard</Link>
          <div className="hidden sm:flex items-center gap-6">
            <Link to="/jobs" className={`text-sm ${isActive('/jobs')}`}>Browse Jobs</Link>
            {user && <Link to="/dashboard" className={`text-sm ${isActive('/dashboard')}`}>Dashboard</Link>}
            {role === 'applicant' && (
              <Link to="/applications" className={`text-sm ${isActive('/applications')}`}>My Applications</Link>
            )}
            {(role === 'recruiter' || role === 'admin') && (
              <Link to="/jobs/new" className={`text-sm ${isActive('/jobs/new')}`}>Post a Job</Link>
            )}
            {role === 'admin' && (
              <Link to="/admin" className={`text-sm ${isActive('/admin')}`}>Admin</Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-gray-700">{user.name}</span>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full capitalize">{role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-indigo-600">Login</Link>
              <Link to="/register" className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition">
                Register
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  )
}
