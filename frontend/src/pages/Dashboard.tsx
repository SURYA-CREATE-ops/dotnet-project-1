import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import StatusBadge from '../components/StatusBadge'
import { authService } from '../services/authService'
import { jobsService, type Job } from '../services/jobsService'

interface Stats {
  total: number
  pending: number
  running: number
  completed: number
  failed: number
  successRate: number
}

const calcStats = (jobs: Job[]): Stats => {
  const total = jobs.length
  const pending = jobs.filter(j => j.status === 'Pending').length
  const running = jobs.filter(j => j.status === 'Running').length
  const completed = jobs.filter(j => j.status === 'Completed').length
  const failed = jobs.filter(j => j.status === 'Failed').length
  const successRate = total > 0 ? Math.round((completed / total) * 100) : 0
  return { total, pending, running, completed, failed, successRate }
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

interface StatCardProps {
  label: string
  value: number | string
  color: string
  sub?: string
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color, sub }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-5 flex flex-col gap-1`}>
    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
    <span className={`text-3xl font-bold ${color}`}>{value}</span>
    {sub && <span className="text-xs text-gray-400">{sub}</span>}
  </div>
)

interface WorkerFeatureProps {
  label: string
  value: string
  dot: string
}

const WorkerFeature: React.FC<WorkerFeatureProps> = ({ label, value, dot }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-600">{label}</span>
    <span className={`flex items-center gap-1.5 text-xs font-semibold ${dot}`}>
      <span className="inline-block w-2 h-2 rounded-full bg-current opacity-80" />
      {value}
    </span>
  </div>
)

const Dashboard: React.FC = () => {
  const user = authService.getUser()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    jobsService.getJobs()
      .then(data => setJobs(data))
      .catch(() => setError('Failed to load job data.'))
      .finally(() => setLoading(false))
  }, [])

  const stats = calcStats(jobs)
  const recentJobs = [...jobs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            {user && (
              <p className="text-sm text-gray-500 mt-0.5">
                Welcome back, <span className="font-semibold text-gray-700">{user.name}</span>
              </p>
            )}
          </div>
          <Link
            to="/jobs"
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
          >
            Manage Jobs
          </Link>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded text-sm">{error}</div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            label="Total Jobs"
            value={loading ? '—' : stats.total}
            color="text-gray-900"
          />
          <StatCard
            label="Pending"
            value={loading ? '—' : stats.pending}
            color="text-yellow-600"
          />
          <StatCard
            label="Running"
            value={loading ? '—' : stats.running}
            color="text-blue-600"
          />
          <StatCard
            label="Completed"
            value={loading ? '—' : stats.completed}
            color="text-green-600"
          />
          <StatCard
            label="Failed"
            value={loading ? '—' : stats.failed}
            color="text-red-600"
          />
          <StatCard
            label="Success Rate"
            value={loading ? '—' : `${stats.successRate}%`}
            color={stats.successRate >= 80 ? 'text-green-600' : stats.successRate >= 50 ? 'text-yellow-600' : 'text-red-600'}
            sub="Completed / Total"
          />
        </div>

        {/* Recent Jobs + Worker Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Jobs — takes 2/3 width on large screens */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Recent Jobs</h2>
              <Link to="/jobs" className="text-xs text-blue-600 hover:underline">View all</Link>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12 text-gray-400 text-sm">
                <svg className="animate-spin h-5 w-5 mr-2 text-blue-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Loading…
              </div>
            ) : recentJobs.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                No jobs yet.{' '}
                <Link to="/jobs/create" className="text-blue-600 hover:underline">Create one</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                      <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Priority</th>
                      <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentJobs.map(job => (
                      <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 font-medium text-gray-800 max-w-[180px] truncate">{job.name}</td>
                        <td className="px-5 py-3"><StatusBadge status={job.status} /></td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            job.priority === 'High' ? 'bg-red-100 text-red-700' :
                            job.priority === 'Medium' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {job.priority}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{formatDate(job.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Worker Status Panel — takes 1/3 width on large screens */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">System Status</h2>
            </div>
            <div className="px-5 py-3">
              <WorkerFeature label="Worker Status"      value="Active"   dot="text-green-600" />
              <WorkerFeature label="Processing Engine"  value="Online"   dot="text-green-600" />
              <WorkerFeature label="Scheduling"         value="Enabled"  dot="text-blue-500"  />
              <WorkerFeature label="Priority Queue"     value="Enabled"  dot="text-blue-500"  />
              <WorkerFeature label="Retry Logic"        value="Enabled"  dot="text-blue-500"  />
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  )
}

export default Dashboard
