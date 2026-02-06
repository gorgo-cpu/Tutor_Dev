import React from 'react'
import { format } from 'date-fns'

export default function UpcomingList({ title = 'Upcoming', events = [] }) {
  if (!events.length) {
    return (
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
        <p className="text-sm text-gray-500">No upcoming items.</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-3">
        {events.map((evt) => (
          <div key={evt.id} className="border border-gray-100 rounded-lg p-3">
            <div className="text-sm font-semibold text-gray-900">{evt.title}</div>
            <div className="text-xs text-gray-600">
              {format(evt.start, 'EEE, MMM d - p')} - {format(evt.end, 'p')}
            </div>
            {evt.location && <div className="text-xs text-gray-500 mt-1">Location: {evt.location}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
