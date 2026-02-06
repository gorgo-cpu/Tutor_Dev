import React, { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import AuthForm from './AuthForm.jsx'
import ScheduleCalendar from './ScheduleCalendar.jsx'
import UpcomingList from './UpcomingList.jsx'
import { supabase } from './supabaseClient.js'
import { useSupabaseAuth } from './SupabaseProvider.jsx'

const toCalendarEvent = (lesson) => ({
  id: lesson.id,
  title: lesson.title || 'Lesson',
  start: new Date(lesson.start_at),
  end: new Date(lesson.end_at),
  location: lesson.location || null,
  category: 'class',
})

export default function Students({ onBack }) {
  const { user, role, profile, loading, signOut } = useSupabaseAuth() || {}
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [dataError, setDataError] = useState('')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!user || role !== 'student') return
      setDataError('')
      const { data, error } = await supabase
        .from('lessons')
        .select('id,title,start_at,end_at,location')
        .eq('student_id', user.id)
        .order('start_at', { ascending: true })
      if (cancelled) return
      if (error) {
        setDataError(error.message)
        setEvents([])
        return
      }
      setEvents((data || []).map(toCalendarEvent))
    }

    load()
    return () => {
      cancelled = true
    }
  }, [role, user])

  const upcoming = useMemo(() => {
    const now = new Date()
    return [...events].filter((e) => e.start >= now).sort((a, b) => a.start - b.start).slice(0, 4)
  }, [events])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-sm text-gray-600">Loading session...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                >
                  Back to Home
                </button>
              )}
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Student Dashboard</h1>
                <p className="text-sm text-gray-600">Sign in to view your schedule.</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <AuthForm initialMode="login" initialRole="student" />
          </div>
        </div>
      </div>
    )
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-xl mx-auto bg-white border border-gray-100 shadow rounded-2xl p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Pending approval</h1>
              <p className="text-sm text-gray-600 mt-2">
                Your requested role must be approved before you can access dashboards.
              </p>
              <div className="text-sm text-gray-700 mt-3">
                Requested role:{' '}
                <span className="font-semibold text-indigo-700">
                  {profile?.requested_role || user?.user_metadata?.requested_role || 'N/A'}
                </span>
              </div>
            </div>
            <button
              onClick={signOut}
              className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (role !== 'student') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-xl mx-auto bg-white border border-gray-100 shadow rounded-2xl p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Role mismatch</h1>
              <p className="text-sm text-gray-600 mt-2">
                You are signed in as <span className="font-semibold text-indigo-700">{role}</span>. This page is for
                students.
              </p>
            </div>
            <button
              onClick={signOut}
              className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
            >
              Logout
            </button>
          </div>
          <div className="mt-4">
            {onBack && (
              <button
                onClick={onBack}
                className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
              >
                Back to Home
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-y-auto bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
              >
                Back to Home
              </button>
            )}
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Student Dashboard</h1>
              <p className="text-sm text-gray-600">Weekly schedule and upcoming lessons.</p>
            </div>
          </div>
          <button onClick={signOut} className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm">
            Logout
          </button>
        </div>

        {dataError && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{dataError}</div>
        )}

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ScheduleCalendar events={events} onSelectEvent={setSelectedEvent} />
          </div>
          <div className="space-y-4">
            <UpcomingList title="Upcoming" events={upcoming} />
            {selectedEvent && (
              <div className="bg-white shadow rounded-lg p-4 border border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{selectedEvent.title}</div>
                    <div className="text-xs text-gray-600">
                      {format(selectedEvent.start, 'EEE, MMM d - p')} - {format(selectedEvent.end, 'p')}
                    </div>
                    {selectedEvent.location && (
                      <div className="text-xs text-gray-500 mt-1">Location: {selectedEvent.location}</div>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
