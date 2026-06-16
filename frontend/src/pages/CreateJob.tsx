import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { jobsService, extractErrorMessage, type JobPriority, type JobType } from '../services/jobsService'

const CreateJob: React.FC = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'Report' as JobType,
    priority: 'Medium' as JobPriority,
    scheduledAt: new Date().toISOString().slice(0, 16),
    maxRetries: 3,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'maxRetries' ? Number(value) : value,
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await jobsService.createJob({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        type: form.type,
        priority: form.priority,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        maxRetries: form.maxRetries,
      })
      navigate('/jobs')
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to create job. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Job</h1>
          <p className="text-sm text-gray-500 mt-1">Add a new job to the queue.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded text-sm">
              {error}
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
                placeholder="e.g. Weekly Report"
                minLength={3}
                maxLength={100}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
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
                placeholder="Optional description"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
              <p className="text-xs text-gray-400 mt-1">Between 1 and 10.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded font-medium text-sm hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Creating…' : 'Create Job'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/jobs')}
                disabled={loading}
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

export default CreateJob
