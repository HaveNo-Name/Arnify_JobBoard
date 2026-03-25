import { createSlice } from '@reduxjs/toolkit'

const stored = JSON.parse(localStorage.getItem('auth') || 'null')

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: stored?.user || null,
    token: stored?.token || null,
    role: stored?.role || null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, role } = action.payload
      state.user = user
      state.token = token
      state.role = role
      localStorage.setItem('auth', JSON.stringify({ user, token, role }))
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.role = null
      localStorage.removeItem('auth')
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
export const selectUser = (state) => state.auth.user
export const selectRole = (state) => state.auth.role
export const selectToken = (state) => state.auth.token
