import React, { useMemo } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import enUS from 'date-fns/locale/en-US'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
})

const palette = {
  class: '#4f46e5',
  conversation: '#0ea5e9',
  support: '#22c55e',
  exam: '#f97316',
  meeting: '#6366f1',
  availability: '#6b7280',
}

export default function ScheduleCalendar({ events = [], onSelectEvent }) {
  const eventStyleGetter = useMemo(
    () => (event) => {
      const base = palette[event.category] || '#334155'
      return {
        style: {
          backgroundColor: base,
          color: '#fff',
          borderRadius: 8,
          border: 'none',
          padding: '2px 6px',
        },
      }
    },
    []
  )

  return (
    <div className="bg-white shadow rounded-lg p-4 border border-gray-100">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 420 }}
        views={['week', 'day']}
        defaultView="week"
        toolbar
        popup
        showMultiDayTimes
        onSelectEvent={onSelectEvent}
        eventPropGetter={eventStyleGetter}
      />
    </div>
  )
}
