import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { jobsService, extractErrorMessage, type JobPriority, type JobType } from '../services/jobsService'

const EditJob: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'Report' as JobType,
    priority: 'Medium' as JobPriority,
    scheduledAt: '',
    maxRetries: 3,
  })
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    const fetchJob = async () => {
      try {
        const job = await jobsService.getJob(id)
        setForm({
          name: job.name,
          description: job.description ?? '',
          type: job.type,
          priority: job.priority,
          scheduledAt: new Date(job.scheduledAt).toISOString().slice(0, 16),
          maxRetries: job.maxRetries,
        })
      } catch {
        setLoadError('Failed to load job.')
      } finally {
        setLoading(false)
      }
    }
    fetchJob()
  }, [id])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'maxRetries' ? Number(value) : value,
    }))
    setSaveError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setSaving(true)
    setSaveError('')
    try {
      await jobsService.updateJob(id, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        type: form.type,
        priority: form.priority,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        maxRetries: form.maxRetries,
      })
      navigate('/jobs')
    } catch (err) {
      setSaveError(extractErrorMessage(err, 'Failed to save changes. Please try again.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-20 text-gray-500">
          <svg className="animate-spin h-6 w-6 mr-2 text-blue-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading job…
        </div>
      </MainLayout>
    )
  }

  if (loadError) {
    return (
      <MainLayout>
        <div className="max-w-lg mx-auto">
          <div className="p-4 bg-red-50 border border-red-300 text-red-700 rounded text-sm">{loadError}</div>
          <button onClick={() => navigate('/jobs')} className="mt-4 text-blue-600 hover:underline text-sm">
            ← Back to Jobs
          </button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Job</h1>
          <p className="text-sm text-gray-500 mt-1">Update job details.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          {saveError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded text-sm">
              {saveError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                minLength={3}
                maxLength={100}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={saving}
              />
              <p className="text-xs text-gray-400 mt-1">3–100 characters. Must be unique.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              >
                <option value="Email">Email</option>
                <option value="Meeting">Meeting</option>
                <option value="Report">Report</option>
                <option value="FileProcessing">File Processing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled At</label>
              <input
                type="datetime-local"
                name="scheduledAt"
                value={form.scheduledAt}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              />
              <p className="text-xs text-gray-400 mt-1">Cannot be in the past or more than 1 year ahead.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Retries</label>
              <input
                type="number"
                name="maxRetries"
                value={form.maxRetries}
                onChange={handleChange}
                min={1}
                max={10}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              />
              <p className="text-xs text-gray-400 mt-1">Between 1 and 10.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2 rounded font-medium text-sm hover:bg-blue-700 disabled:bg-gray-400"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/jobs')}
                disabled={saving}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded font-medium text-sm hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  )
}

export default EditJob
