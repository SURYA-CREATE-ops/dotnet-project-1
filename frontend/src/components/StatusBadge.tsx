import React from 'react'
import type { JobStatus } from '../services/jobsService'

const statusStyles: Record<JobStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  Running: 'bg-blue-100 text-blue-800 border border-blue-300',
  Completed: 'bg-green-100 text-green-800 border border-green-300',
  Failed: 'bg-red-100 text-red-800 border border-red-300',
}

interface StatusBadgeProps {
  status: JobStatus
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => (
  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyles[status] ?? 'bg-gray-100 text-gray-700'}`}>
    {status}
  </span>
)

export default StatusBadge
