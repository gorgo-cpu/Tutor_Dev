import React from 'react'
import { format } from 'date-fns'

export default function TeacherGrid({ teachers = [], onSelect }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {teachers.map((teacher) => {
        const ratingLabel =
          typeof teacher.rating === 'number' && Number.isFinite(teacher.rating)
            ? `${teacher.rating.toFixed(1)} stars`
            : null
        const nextSlot = teacher.nextSlot ? new Date(teacher.nextSlot) : null
        const subjects = Array.isArray(teacher.subjects) ? teacher.subjects : []

        return (
          <div key={teacher.id} className="bg-white shadow rounded-lg p-4 border border-gray-100">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-gray-900">{teacher.name}</div>
                {subjects.length > 0 && <div className="text-xs text-gray-500">{subjects.join(', ')}</div>}
              </div>
              {ratingLabel && (
                <div className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
                  {ratingLabel}
                </div>
              )}
            </div>

            {teacher.focus && <p className="text-sm text-gray-700 mt-2">{teacher.focus}</p>}

            {nextSlot && (
              <div className="text-xs text-gray-600 mt-3">
                Next availability: {format(nextSlot, 'EEE, MMM d - p')}
              </div>
            )}

            <button
              onClick={() => onSelect && onSelect(teacher)}
              className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700"
            >
              View availability
            </button>
          </div>
        )
      })}
    </div>
  )
}
