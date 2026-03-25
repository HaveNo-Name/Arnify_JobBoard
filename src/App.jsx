import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'
import Register from './pages/Register'
import Jobs from './pages/Jobs'
import JobDetails from './pages/JobDetails'
import JobForm from './pages/JobForm'
import Dashboard from './pages/Dashboard'
import MyApplications from './pages/MyApplications'
import Admin from './pages/Admin'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="pt-16 min-h-screen bg-gray-50">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/jobs" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />

          {/* Any logged-in user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/applications" element={<MyApplications />} />
          </Route>

          {/* Recruiter + Admin */}
          <Route element={<ProtectedRoute roles={['recruiter', 'admin']} />}>
            <Route path="/jobs/new" element={<JobForm />} />
            <Route path="/jobs/:id/edit" element={<JobForm />} />
          </Route>

          {/* Admin only */}
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/admin" element={<Admin />} />
          </Route>

          <Route path="*" element={<Navigate to="/jobs" replace />} />
        </Routes>
      </div>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </BrowserRouter>
  )
}
