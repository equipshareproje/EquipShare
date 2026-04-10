import React, { useState } from 'react';

export default function DateRangeCalendar({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate,
  maxDate,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [parsedYear, parsedMonth, parsedDay] = dateStr.split('-').map(Number);
    return new Date(parsedYear, parsedMonth - 1, parsedDay);
  };

  const normalizeDate = (date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const isDateInRange = (date, start, end) => {
    const d = normalizeDate(date);
    const s = parseDate(start);
    const e = parseDate(end);

    if (!s || !e) return false;
    return d >= s && d <= e;
  };

  const isDateDisabled = (date) => {
    const d = normalizeDate(date);
    const min = parseDate(minDate);
    const max = parseDate(maxDate);

    return (min && d < min) || (max && d > max);
  };

  const formatDateForInput = (date) => {
    const formattedYear = date.getFullYear();
    const formattedMonth = String(date.getMonth() + 1).padStart(2, '0');
    const formattedDay = String(date.getDate()).padStart(2, '0');
    return `${formattedYear}-${formattedMonth}-${formattedDay}`;
  };

  const formatDisplayDate = (dateStr) => {
    const parsed = parseDate(dateStr);
    return parsed ? parsed.toLocaleDateString() : '';
  };

  const isToday = (date) => {
    const today = new Date();
    return normalizeDate(date).toDateString() === normalizeDate(today).toDateString();
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(year, month, day);

    if (isDateDisabled(clickedDate)) return;

    const clickedDateStr = formatDateForInput(clickedDate);

    if (!startDate || (startDate && endDate)) {
      onStartDateChange(clickedDateStr);
      onEndDateChange('');
    } else if (startDate && !endDate) {
      const start = parseDate(startDate);

      if (clickedDate < start) {
        onStartDateChange(clickedDateStr);
      } else if (clickedDate.toDateString() === start.toDateString()) {
        return;
      } else {
        onEndDateChange(clickedDateStr);
      }
    }
  };

  const previousMonthDate = new Date(year, month - 1, 1);
  const nextMonthDate = new Date(year, month + 1, 1);

  const min = parseDate(minDate);
  const max = parseDate(maxDate);

  const isPrevMonthDisabled =
    min &&
    previousMonthDate.getFullYear() === min.getFullYear() &&
    previousMonthDate.getMonth() < min.getMonth() &&
    previousMonthDate.getFullYear() <= min.getFullYear();

  const isNextMonthDisabled =
    max &&
    nextMonthDate.getFullYear() === max.getFullYear() &&
    nextMonthDate.getMonth() > max.getMonth() &&
    nextMonthDate.getFullYear() >= max.getFullYear();

  const handlePrevMonth = () => {
    if (isPrevMonthDisabled) return;
    setCurrentDate(previousMonthDate);
  };

  const handleNextMonth = () => {
    if (isNextMonthDisabled) return;
    setCurrentDate(nextMonthDate);
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-[#0A1F29] mb-3">
        Select Date Range <span className="text-red-600">*</span>
      </label>

      <div className="bg-white border border-[#D0DDE2] rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={isPrevMonthDisabled}
            aria-label="Previous month"
            className={`p-2 rounded transition-colors ${
              isPrevMonthDisabled
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:bg-[#F4F7F8]'
            }`}
          >
            ←
          </button>

          <h3 className="text-lg font-bold text-[#003E51]">
            {monthNames[month]} {year}
          </h3>

          <button
            type="button"
            onClick={handleNextMonth}
            disabled={isNextMonthDisabled}
            aria-label="Next month"
            className={`p-2 rounded transition-colors ${
              isNextMonthDisabled
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:bg-[#F4F7F8]'
            }`}
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {days.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-bold text-[#4A6572] py-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="aspect-square"></div>;
            }

            const date = new Date(year, month, day);
            const dateStr = formatDateForInput(date);
            const disabled = isDateDisabled(date);
            const start = dateStr === startDate;
            const end = dateStr === endDate;
            const inRange = isDateInRange(date, startDate, endDate);
            const today = isToday(date);

            return (
              <button
                key={day}
                type="button"
                onClick={() => handleDateClick(day)}
                disabled={disabled}
                aria-label={`Select ${date.toDateString()}`}
                className={`
                  aspect-square rounded text-sm font-semibold flex items-center justify-center
                  transition-all duration-150 cursor-pointer border
                  ${disabled ? 'bg-red-100 text-red-400 cursor-not-allowed opacity-50 border-red-200' : 'border-transparent'}
                  ${!disabled && !start && !end && !inRange ? 'bg-[#F4F7F8] text-[#0A1F29] hover:bg-[#E0E8ED]' : ''}
                  ${start || end ? 'bg-[#003E51] text-white ring-2 ring-[#003E51] border-[#003E51]' : ''}
                  ${inRange && !start && !end ? 'bg-[#A8D5E2] text-[#003E51] border-[#A8D5E2]' : ''}
                  ${today && !start && !end && !inRange && !disabled ? 'ring-1 ring-[#00879E]' : ''}
                `}
                title={disabled ? 'Not available' : today ? 'Today' : ''}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-[#D0DDE2] flex items-center gap-4 text-xs flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#003E51] rounded"></div>
            <span className="text-[#4A6572]">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#A8D5E2] rounded"></div>
            <span className="text-[#4A6572]">In Range</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 rounded"></div>
            <span className="text-[#4A6572]">Unavailable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border border-[#00879E] rounded"></div>
            <span className="text-[#4A6572]">Today</span>
          </div>
        </div>

        {(startDate || endDate) && (
          <div className="mt-4 pt-4 border-t border-[#D0DDE2]">
            <div className="text-xs font-semibold text-[#0A1F29] mb-2">
              Selected Period:
            </div>
            <div className="text-sm text-[#4A6572] space-y-1">
              {startDate && (
                <p>
                  <span className="font-semibold">From:</span>{' '}
                  {formatDisplayDate(startDate)}
                </p>
              )}
              {endDate && (
                <p>
                  <span className="font-semibold">To:</span>{' '}
                  {formatDisplayDate(endDate)}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}