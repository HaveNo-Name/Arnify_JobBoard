import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// ─── Seed demo data on first load ───────────────────────────────────────────
const seedJobs = () => {
  if (localStorage.getItem('jobs')) return
  const jobs = [
    {
      id: '1', title: 'Frontend Developer', company: 'Acme Corp',
      location: 'Bangalore', category: 'Engineering', type: 'Full-time',
      salaryMin: 800000, salaryMax: 1200000,
      description: 'Build modern UIs using React and Tailwind CSS. Work with a fast-moving product team.',
      requirements: ['React', 'JavaScript', 'CSS', 'Git'],
      postedBy: 'recruiter1', postedByName: 'TechRecruiter',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: '2', title: 'Backend Engineer', company: 'StartupXYZ',
      location: 'Remote', category: 'Engineering', type: 'Full-time',
      salaryMin: 1000000, salaryMax: 1600000,
      description: 'Design and build scalable REST APIs. Strong Node.js and database experience needed.',
      requirements: ['Node.js', 'PostgreSQL', 'REST APIs', 'Docker'],
      postedBy: 'recruiter1', postedByName: 'TechRecruiter',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: '3', title: 'Product Designer', company: 'DesignCo',
      location: 'Mumbai', category: 'Design', type: 'Contract',
      salaryMin: 600000, salaryMax: 900000,
      description: 'Create beautiful, user-centric designs for web and mobile products.',
      requirements: ['Figma', 'User Research', 'Prototyping'],
      postedBy: 'recruiter2', postedByName: 'DesignHR',
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: '4', title: 'Data Analyst', company: 'DataVision',
      location: 'Hyderabad', category: 'Data', type: 'Full-time',
      salaryMin: 700000, salaryMax: 1000000,
      description: 'Analyze large datasets and generate actionable insights for business teams.',
      requirements: ['Python', 'SQL', 'Tableau', 'Excel'],
      postedBy: 'recruiter2', postedByName: 'DesignHR',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: '5', title: 'DevOps Engineer', company: 'CloudBase',
      location: 'Remote', category: 'Engineering', type: 'Full-time',
      salaryMin: 1200000, salaryMax: 1800000,
      description: 'Manage CI/CD pipelines and cloud infrastructure on AWS.',
      requirements: ['AWS', 'Kubernetes', 'Terraform', 'Linux'],
      postedBy: 'recruiter1', postedByName: 'TechRecruiter',
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
  ]
  localStorage.setItem('jobs', JSON.stringify(jobs))
}

const seedUsers = () => {
  if (localStorage.getItem('users')) return
  const users = [
    { id: 'admin1', name: 'Admin User', email: 'admin@demo.com', password: 'admin123', role: 'admin' },
    { id: 'recruiter1', name: 'TechRecruiter', email: 'recruiter@demo.com', password: 'recruiter123', role: 'recruiter' },
    { id: 'recruiter2', name: 'DesignHR', email: 'recruiter2@demo.com', password: 'recruiter123', role: 'recruiter' },
    { id: 'applicant1', name: 'Jane Applicant', email: 'applicant@demo.com', password: 'applicant123', role: 'applicant' },
  ]
  localStorage.setItem('users', JSON.stringify(users))
}

seedJobs()
seedUsers()

// ─── Helper ─────────────────────────────────────────────────────────────────
const ls = (key) => JSON.parse(localStorage.getItem(key) || '[]')
const lsSet = (key, val) => localStorage.setItem(key, JSON.stringify(val))

// ─── API ─────────────────────────────────────────────────────────────────────
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  tagTypes: ['Job', 'Application', 'User'],

  endpoints: (builder) => ({

    // ── AUTH ──────────────────────────────────────────────────────────────
    login: builder.mutation({
      queryFn: ({ email, password }) => {
        const users = ls('users')
        const user = users.find(u => u.email === email && u.password === password)
        if (!user) return { error: { status: 401, data: 'Invalid email or password' } }
        const { password: _, ...safeUser } = user
        return { data: { user: safeUser, token: `mock-token-${user.id}`, role: user.role } }
      },
    }),

    register: builder.mutation({
      queryFn: ({ name, email, password, role }) => {
        const users = ls('users')
        if (users.find(u => u.email === email))
          return { error: { status: 400, data: 'Email already registered' } }
        const newUser = { id: crypto.randomUUID(), name, email, password, role }
        lsSet('users', [...users, newUser])
        const { password: _, ...safeUser } = newUser
        return { data: { user: safeUser, token: `mock-token-${newUser.id}`, role } }
      },
    }),

    // ── JOBS ──────────────────────────────────────────────────────────────
    getJobs: builder.query({
      queryFn: ({ search = '', category = 'All', sort = 'newest' } = {}) => {
        let jobs = ls('jobs')
        if (search) jobs = jobs.filter(j =>
          j.title.toLowerCase().includes(search.toLowerCase()) ||
          j.company.toLowerCase().includes(search.toLowerCase()) ||
          j.location.toLowerCase().includes(search.toLowerCase())
        )
        if (category !== 'All') jobs = jobs.filter(j => j.category === category)
        if (sort === 'newest') jobs = [...jobs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        if (sort === 'salary') jobs = [...jobs].sort((a, b) => b.salaryMax - a.salaryMax)
        return { data: jobs }
      },
      providesTags: ['Job'],
    }),

    getJobById: builder.query({
      queryFn: (id) => {
        const job = ls('jobs').find(j => j.id === id)
        return job ? { data: job } : { error: { status: 404, data: 'Job not found' } }
      },
      providesTags: (result, error, id) => [{ type: 'Job', id }],
    }),

    createJob: builder.mutation({
      queryFn: (body) => {
        const newJob = {
          ...body,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }
        lsSet('jobs', [newJob, ...ls('jobs')])
        return { data: newJob }
      },
      invalidatesTags: ['Job'],
    }),

    updateJob: builder.mutation({
      queryFn: ({ id, ...body }) => {
        const jobs = ls('jobs')
        const updated = jobs.map(j => j.id === id ? { ...j, ...body } : j)
        lsSet('jobs', updated)
        return { data: updated.find(j => j.id === id) }
      },
      invalidatesTags: (result, error, { id }) => ['Job', { type: 'Job', id }],
    }),

    deleteJob: builder.mutation({
      queryFn: (id) => {
        lsSet('jobs', ls('jobs').filter(j => j.id !== id))
        return { data: { id } }
      },
      invalidatesTags: ['Job'],
    }),

    // ── APPLICATIONS ──────────────────────────────────────────────────────
    applyToJob: builder.mutation({
      queryFn: ({ jobId, jobTitle, company, userId, userName, coverNote }) => {
        const apps = ls('applications')
        if (apps.find(a => a.jobId === jobId && a.userId === userId))
          return { error: { status: 400, data: 'You have already applied to this job' } }
        const newApp = {
          id: crypto.randomUUID(),
          jobId, jobTitle, company,
          userId, userName,
          coverNote: coverNote || '',
          status: 'Pending',
          appliedAt: new Date().toISOString(),
        }
        lsSet('applications', [...apps, newApp])
        return { data: newApp }
      },
      invalidatesTags: ['Application'],
    }),

    getMyApplications: builder.query({
      queryFn: (userId) => {
        return { data: ls('applications').filter(a => a.userId === userId) }
      },
      providesTags: ['Application'],
    }),

    getJobApplicants: builder.query({
      queryFn: (jobId) => {
        return { data: ls('applications').filter(a => a.jobId === jobId) }
      },
      providesTags: ['Application'],
    }),

    updateAppStatus: builder.mutation({
      queryFn: ({ appId, status }) => {
        const apps = ls('applications')
        const updated = apps.map(a => a.id === appId ? { ...a, status } : a)
        lsSet('applications', updated)
        return { data: updated.find(a => a.id === appId) }
      },
      invalidatesTags: ['Application'],
    }),

    withdrawApplication: builder.mutation({
      queryFn: (appId) => {
        lsSet('applications', ls('applications').filter(a => a.id !== appId))
        return { data: { id: appId } }
      },
      invalidatesTags: ['Application'],
    }),

    // ── ADMIN ─────────────────────────────────────────────────────────────
    getAllUsers: builder.query({
      queryFn: () => {
        return { data: ls('users').map(({ password: _, ...u }) => u) }
      },
      providesTags: ['User'],
    }),

    updateUserRole: builder.mutation({
      queryFn: ({ userId, role }) => {
        const users = ls('users')
        const updated = users.map(u => u.id === userId ? { ...u, role } : u)
        lsSet('users', updated)
        return { data: updated.find(u => u.id === userId) }
      },
      invalidatesTags: ['User'],
    }),

  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetJobsQuery,
  useGetJobByIdQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
  useApplyToJobMutation,
  useGetMyApplicationsQuery,
  useGetJobApplicantsQuery,
  useUpdateAppStatusMutation,
  useWithdrawApplicationMutation,
  useGetAllUsersQuery,
  useUpdateUserRoleMutation,
} = api
