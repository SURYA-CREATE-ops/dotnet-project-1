import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import StatusBadge from '../components/StatusBadge'
import { jobsService, type Job, JOB_TYPE_LABELS } from '../services/jobsService'

const priorityOrder = { High: 0, Medium: 1, Low: 2 }

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

const Jobs: React.FC = () => {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const fetchJobs = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await jobsService.getJobs()
      data.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      setJobs(data)
    } catch {
      setError('Failed to load jobs. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await jobsService.deleteJob(id)
      setJobs(prev => prev.filter(j => j.id !== id))
    } catch {
      setError('Failed to delete job.')
    } finally {
      setDeletingId(null)
      setConfirmId(null)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <Link
            to="/jobs/create"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium"
          >
            + Create Job
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20 text-gray-500">
            <svg className="animate-spin h-6 w-6 mr-2 text-blue-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Loading jobs...
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg mb-4">No jobs yet.</p>
            <Link
              to="/jobs/create"
              className="inline-block bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 text-sm font-medium"
            >
              Create your first job
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'Type', 'Status', 'Priority', 'Scheduled At', 'Retries', 'Created At', 'Actions'].map(h => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {jobs.map(job => (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{job.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                        {JOB_TYPE_LABELS[job.type] ?? job.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                          job.priority === 'High'
                            ? 'bg-red-100 text-red-700'
                            : job.priority === 'Medium'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {job.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(job.scheduledAt)}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {job.retryCount}/{job.maxRetries}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(job.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/jobs/${job.id}/logs`)}
                          className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                        >
                          Logs
                        </button>
                        <button
                          onClick={() => navigate(`/jobs/edit/${job.id}`)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          Edit
                        </button>
                        {confirmId === job.id ? (
                          <>
                            <span className="text-xs text-gray-500">Sure?</span>
                            <button
                              onClick={() => handleDelete(job.id)}
                              disabled={deletingId === job.id}
                              className="text-red-600 hover:text-red-800 text-xs font-medium disabled:opacity-50"
                            >
                              {deletingId === job.id ? 'Deleting…' : 'Yes'}
                            </button>
                            <button
                              onClick={() => setConfirmId(null)}
                              className="text-gray-500 hover:text-gray-700 text-xs"
                            >
                              No
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setConfirmId(job.id)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default Jobs
