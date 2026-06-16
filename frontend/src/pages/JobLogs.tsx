import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import StatusBadge from '../components/StatusBadge'
import { jobsService, type Job, type JobExecutionLog } from '../services/jobsService'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

const getLogStyle = (message: string): string => {
  const m = message.toLowerCase()
  if (m.includes('created'))         return 'bg-blue-50 border-blue-300 text-blue-800'
  if (m.includes('started'))         return 'bg-indigo-50 border-indigo-300 text-indigo-800'
  if (m.includes('completed'))       return 'bg-green-50 border-green-300 text-green-800'
  if (m.includes('failed'))          return 'bg-red-50 border-red-300 text-red-800'
  if (m.includes('retry'))           return 'bg-yellow-50 border-yellow-300 text-yellow-800'
  return 'bg-gray-50 border-gray-300 text-gray-700'
}

const getDotColor = (message: string): string => {
  const m = message.toLowerCase()
  if (m.includes('created'))   return 'bg-blue-500'
  if (m.includes('started'))   return 'bg-indigo-500'
  if (m.includes('completed')) return 'bg-green-500'
  if (m.includes('failed'))    return 'bg-red-500'
  if (m.includes('retry'))     return 'bg-yellow-500'
  return 'bg-gray-400'
}

const JobLogs: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [job, setJob] = useState<Job | null>(null)
  const [logs, setLogs] = useState<JobExecutionLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const [jobData, logData] = await Promise.all([
          jobsService.getJob(id),
          jobsService.getJobLogs(id),
        ])
        setJob(jobData)
        setLogs(logData)
      } catch {
        setError('Failed to load job logs.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate('/jobs')}
          className="text-sm text-blue-600 hover:underline mb-5 inline-flex items-center gap-1"
        >
          ← Back to Jobs
        </button>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-gray-400">
            <svg className="animate-spin h-6 w-6 mr-2 text-blue-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Loading logs…
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-300 text-red-700 rounded text-sm">{error}</div>
        ) : (
          <>
            {/* Job Header */}
            {job && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 mb-6">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{job.name}</h1>
                    {job.description && (
                      <p className="text-sm text-gray-500 mt-0.5">{job.description}</p>
                    )}
                  </div>
                  <StatusBadge status={job.status} />
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                  <span>Type: <span className="font-medium text-gray-700">{job.type}</span></span>
                  <span>Priority: <span className="font-medium text-gray-700">{job.priority}</span></span>
                  <span>Retries: <span className="font-medium text-gray-700">{job.retryCount}/{job.maxRetries}</span></span>
                  <span>Created: <span className="font-medium text-gray-700">{formatDate(job.createdAt)}</span></span>
                </div>
                {job.errorMessage && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    Last error: {job.errorMessage}
                  </div>
                )}
              </div>
            )}

            {/* Logs Timeline */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">Execution Logs</h2>
                <span className="text-xs text-gray-400">{logs.length} event{logs.length !== 1 ? 's' : ''}</span>
              </div>

              {logs.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                  No log events yet. The worker will log events as it processes this job.
                </div>
              ) : (
                <div className="p-5">
                  <ol className="relative border-l border-gray-200 space-y-6 ml-3">
                    {logs.map((log) => (
                      <li key={log.id} className="ml-6">
                        {/* Timeline dot */}
                        <span className={`absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white ${getDotColor(log.message)}`} />
                        <div className={`p-3 rounded-lg border text-sm ${getLogStyle(log.message)}`}>
                          <p className="font-medium">{log.message}</p>
                          <time className="block mt-1 text-xs opacity-60">
                            {formatDate(log.createdAt)}
                          </time>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  )
}

export default JobLogs
