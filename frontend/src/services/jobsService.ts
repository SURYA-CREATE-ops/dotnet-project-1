import axios from 'axios'
import api from './api'

export type JobPriority = 'Low' | 'Medium' | 'High'
export type JobStatus = 'Pending' | 'Running' | 'Completed' | 'Failed'
export type JobType = 'Email' | 'Meeting' | 'Report' | 'FileProcessing'

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  Email: 'Email',
  Meeting: 'Meeting',
  Report: 'Report',
  FileProcessing: 'File Processing',
}

export interface JobExecutionLog {
  id: string
  jobId: string
  message: string
  createdAt: string
}

export interface Job {
  id: string
  name: string
  description: string | null
  status: JobStatus
  type: JobType
  priority: JobPriority
  scheduledAt: string
  retryCount: number
  maxRetries: number
  errorMessage: string | null
  createdAt: string
  userId: string
}

export interface CreateJobPayload {
  name: string
  description?: string
  type?: JobType
  priority?: JobPriority
  scheduledAt?: string
  maxRetries?: number
}

export interface UpdateJobPayload {
  name?: string
  description?: string
  type?: JobType
  priority?: JobPriority
  scheduledAt?: string
  maxRetries?: number
}

// Extract a readable error message from backend validation responses
export const extractErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data
    if (data?.message) return data.message
    if (typeof data === 'string') return data
    const values = data ? Object.values(data) : []
    if (values.length > 0) return String(values[0])
  }
  return fallback
}

export const jobsService = {
  getJobs: async (): Promise<Job[]> => {
    const response = await api.get<Job[]>('/jobs')
    return response.data
  },

  getJob: async (id: string): Promise<Job> => {
    const response = await api.get<Job>(`/jobs/${id}`)
    return response.data
  },

  createJob: async (payload: CreateJobPayload): Promise<Job> => {
    const response = await api.post<Job>('/jobs', payload)
    return response.data
  },

  updateJob: async (id: string, payload: UpdateJobPayload): Promise<Job> => {
    const response = await api.put<Job>(`/jobs/${id}`, payload)
    return response.data
  },

  deleteJob: async (id: string): Promise<void> => {
    await api.delete(`/jobs/${id}`)
  },

  getJobLogs: async (id: string): Promise<JobExecutionLog[]> => {
    const response = await api.get<JobExecutionLog[]>(`/jobs/${id}/logs`)
    return response.data
  },
}
