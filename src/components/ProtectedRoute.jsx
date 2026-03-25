import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import { selectToken, selectRole } from '../features/authSlice'

export default function ProtectedRoute({ roles }) {
  const token = useSelector(selectToken)
  const role = useSelector(selectRole)

  if (!token) return <Navigate to="/login" replace />

  if (roles && !roles.includes(role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-5xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">403 — Access Denied</h1>
        <p className="text-gray-500 text-sm">You don't have permission to view this page.</p>
      </div>
    )
  }

  return <Outlet />
}
