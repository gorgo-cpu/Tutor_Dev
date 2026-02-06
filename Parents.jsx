import React, { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import AuthForm from './AuthForm.jsx'
import ScheduleCalendar from './ScheduleCalendar.jsx'
import UpcomingList from './UpcomingList.jsx'
import TeacherGrid from './TeacherGrid.jsx'
import { supabase } from './supabaseClient.js'
import { useSupabaseAuth } from './SupabaseProvider.jsx'

const shortId = (value) => (value ? String(value).slice(0, 8) : '')

const toCalendarEvent = (lesson) => ({
  id: lesson.id,
  title: lesson.student_id ? `Student ${shortId(lesson.student_id)} - ${lesson.title || 'Lesson'}` : lesson.title || 'Lesson',
  start: new Date(lesson.start_at),
  end: new Date(lesson.end_at),
  location: lesson.location || null,
  category: 'class',
  student_id: lesson.student_id,
})

export default function Parents({ onBack }) {
  const { user, role, profile, loading, signOut } = useSupabaseAuth() || {}
  const [studentIds, setStudentIds] = useState([])
  const [selectedStudentId, setSelectedStudentId] = useState('')

  const [lessons, setLessons] = useState([])
  const [teachers, setTeachers] = useState([])
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [availability, setAvailability] = useState([])

  const [selectedEvent, setSelectedEvent] = useState(null)
  const [bookingMessage, setBookingMessage] = useState('')
  const [dataError, setDataError] = useState('')

  const events = useMemo(() => lessons.map(toCalendarEvent), [lessons])

  const upcoming = useMemo(() => {
    const now = new Date()
    return [...events].filter((e) => e.start >= now).sort((a, b) => a.start - b.start).slice(0, 4)
  }, [events])

  const loadLinkedStudents = async () => {
    const { data, error } = await supabase
      .from('parent_students')
      .select('student_id')
      .eq('parent_id', user.id)
    if (error) throw error
    const ids = (data || []).map((row) => row.student_id).filter(Boolean)
    setStudentIds(ids)
    if (!selectedStudentId && ids.length) setSelectedStudentId(ids[0])
    if (!ids.length) setSelectedStudentId('')
    return ids
  }

  const loadLessons = async (ids) => {
    if (!ids.length) {
      setLessons([])
      return
    }
    const { data, error } = await supabase
      .from('lessons')
      .select('id,title,start_at,end_at,location,student_id')
      .in('student_id', ids)
      .order('start_at', { ascending: true })
    if (error) throw error
    setLessons(data || [])
  }

  const loadTeachers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id,display_name,email,subjects')
      .eq('role', 'teacher')
      .order('display_name', { ascending: true })
    if (error) throw error
    const mapped = (data || []).map((t) => ({
      id: t.id,
      name: t.display_name || t.email || `Teacher ${shortId(t.id)}`,
      subjects: t.subjects || [],
      rating: 4.8,
      focus: 'Book a slot to schedule a session.',
    }))
    setTeachers(mapped)
    if (!selectedTeacher && mapped.length) setSelectedTeacher(mapped[0])
  }

  const loadAvailability = async (teacherId) => {
    if (!teacherId) {
      setAvailability([])
      return
    }
    const nowIso = new Date().toISOString()
    const { data, error } = await supabase
      .from('teacher_availability')
      .select('id,start_at,end_at,is_booked')
      .eq('teacher_id', teacherId)
      .eq('is_booked', false)
      .gte('start_at', nowIso)
      .order('start_at', { ascending: true })
    if (error) throw error
    setAvailability(data || [])
  }

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!user || role !== 'parent') return
      setDataError('')
      try {
        const ids = await loadLinkedStudents()
        if (cancelled) return
        await Promise.all([loadLessons(ids), loadTeachers()])
      } catch (e) {
        if (cancelled) return
        setDataError(e.message || String(e))
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [role, user])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!user || role !== 'parent') return
      if (!selectedTeacher?.id) return
      try {
        await loadAvailability(selectedTeacher.id)
      } catch (e) {
        if (!cancelled) setDataError(e.message || String(e))
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [role, selectedTeacher, user])

  const handleBookSlot = async (slot) => {
    if (!selectedStudentId) {
      setBookingMessage('No linked student selected. Ask an admin to link a student to your parent account.')
      return
    }
    setBookingMessage('')
    setDataError('')
    const { data, error } = await supabase.rpc('book_slot', {
      availability_id: slot.id,
      student_id: selectedStudentId,
    })
    if (error) {
      setDataError(error.message)
      return
    }
    const start = data?.start_at ? new Date(data.start_at) : null
    const end = data?.end_at ? new Date(data.end_at) : null
    setBookingMessage(
      start && end ? `Booked: ${format(start, 'PPPp')} - ${format(end, 'p')}` : 'Booked successfully.'
    )
    await Promise.all([loadLessons(studentIds), loadAvailability(selectedTeacher?.id)])
  }

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
                <h1 className="text-2xl font-semibold text-gray-900">Parents Dashboard</h1>
                <p className="text-sm text-gray-600">Sign in to view schedules and book teachers.</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <AuthForm initialMode="login" initialRole="parent" />
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

  if (role !== 'parent') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-xl mx-auto bg-white border border-gray-100 shadow rounded-2xl p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Role mismatch</h1>
              <p className="text-sm text-gray-600 mt-2">
                You are signed in as <span className="font-semibold text-indigo-700">{role}</span>. This page is for
                parents.
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
              <h1 className="text-2xl font-semibold text-gray-900">Parents Dashboard</h1>
              <p className="text-sm text-gray-600">Student schedule plus booking for available teachers.</p>
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
            <div className="bg-white shadow rounded-lg p-4 border border-gray-100">
              <div className="text-sm font-semibold text-gray-900">Linked students</div>
              {studentIds.length ? (
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="mt-2 w-full px-3 py-2 rounded border border-gray-200"
                >
                  {studentIds.map((id) => (
                    <option key={id} value={id}>
                      Student {shortId(id)}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-gray-600 mt-2">
                  No linked students. Ask an admin to link a student to your parent account.
                </p>
              )}
            </div>
            <UpcomingList title="Student upcoming" events={upcoming} />
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

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Teachers available for booking</h2>
              <p className="text-sm text-gray-600">Select a teacher and book an open slot.</p>
            </div>
            {bookingMessage && (
              <div className="text-sm text-indigo-700 bg-indigo-50 px-3 py-2 rounded">{bookingMessage}</div>
            )}
          </div>

          <TeacherGrid
            teachers={teachers}
            onSelect={(t) => {
              setSelectedTeacher(t)
              setBookingMessage('')
            }}
          />

          {selectedTeacher && (
            <div className="bg-white shadow rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-gray-900">{selectedTeacher.name}</div>
                  <div className="text-xs text-gray-600">
                    {availability.length ? `${availability.length} open slots` : 'No open slots'}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3 mt-3">
                {availability.map((slot) => (
                  <div key={slot.id} className="border border-gray-100 rounded p-3">
                    <div className="text-sm font-semibold text-gray-900">
                      {format(new Date(slot.start_at), 'EEE, MMM d')}
                    </div>
                    <div className="text-xs text-gray-600">
                      {format(new Date(slot.start_at), 'p')} - {format(new Date(slot.end_at), 'p')}
                    </div>
                    <button
                      onClick={() => handleBookSlot(slot)}
                      className="mt-2 px-3 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:bg-indigo-300"
                      disabled={!selectedStudentId}
                    >
                      Book this slot
                    </button>
                  </div>
                ))}
              </div>

              {!availability.length && (
                <p className="text-sm text-gray-600 mt-3">No availability found for this teacher.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
