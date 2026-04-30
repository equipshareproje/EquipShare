import React, { useState } from 'react';

export default function DateRangeCalendar({ startDate, endDate, onStartDateChange, onEndDateChange, minDate, maxDate }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get first day of month and number of days
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Convert date strings to Date objects for comparison (in local timezone)
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    // Parse the date string directly as local date to avoid UTC timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const isDateInRange = (date, start, end) => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const s = parseDate(start);
    const e = parseDate(end);
    if (!s || !e) return false;
    return d >= s && d <= e;
  };

  const isDateDisabled = (date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const min = parseDate(minDate);
    const max = parseDate(maxDate);
    return (min && d < min) || (max && d > max);
  };

  const formatDateForInput = (date) => {
    // Format as YYYY-MM-DD using local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(year, month, day);
    if (isDateDisabled(clickedDate)) return;

    const clickedDateStr = formatDateForInput(clickedDate);

    if (!startDate || (startDate && endDate)) {
      // Set start date
      onStartDateChange(clickedDateStr);
      onEndDateChange('');
    } else if (startDate && !endDate) {
      const start = parseDate(startDate);
      if (clickedDate < start) {
        // If clicked date is before start, make it the new start
        onStartDateChange(clickedDateStr);
      } else if (clickedDate.toDateString() === start.toDateString()) {
        // Same date, do nothing
        return;
      } else {
        // Set end date
        onEndDateChange(clickedDateStr);
      }
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  // Generate calendar days
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
        {/* Month/Year Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-[#F4F7F8] rounded transition-colors"
          >
            ←
          </button>
          <h3 className="text-lg font-bold text-[#003E51]">
            {monthNames[month]} {year}
          </h3>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-[#F4F7F8] rounded transition-colors"
          >
            →
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {days.map(day => (
            <div key={day} className="text-center text-xs font-bold text-[#4A6572] py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="aspect-square"></div>;
            }

            const date = new Date(year, month, day);
            const dateStr = formatDateForInput(date);
            const isDisabled = isDateDisabled(date);
            const isStart = dateStr === startDate;
            const isEnd = dateStr === endDate;
            const isInRange = isDateInRange(date, startDate, endDate);

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                disabled={isDisabled}
                className={`
                  aspect-square rounded text-sm font-semibold flex items-center justify-center
                  transition-all duration-150 cursor-pointer
                  ${isDisabled ? 'bg-red-100 text-red-400 cursor-not-allowed opacity-50' : ''}
                  ${!isDisabled && !isStart && !isEnd && !isInRange ? 'bg-[#F4F7F8] text-[#0A1F29] hover:bg-[#E0E8ED]' : ''}
                  ${isStart || isEnd ? 'bg-[#003E51] text-white ring-2 ring-[#003E51]' : ''}
                  ${isInRange && !isStart && !isEnd ? 'bg-[#A8D5E2] text-[#003E51]' : ''}
                `}
                title={isDisabled ? 'Not available' : ''}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-[#D0DDE2] flex items-center gap-4 text-xs">
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
        </div>

        {/* Selected dates display */}
        {(startDate || endDate) && (
          <div className="mt-4 pt-4 border-t border-[#D0DDE2]">
            <div className="text-xs font-semibold text-[#0A1F29] mb-2">Selected Period:</div>
            <div className="text-sm text-[#4A6572]">
              {startDate && (
                <p>
                  <span className="font-semibold">From:</span> {new Date(startDate).toLocaleDateString()}
                </p>
              )}
              {endDate && (
                <p>
                  <span className="font-semibold">To:</span> {new Date(endDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
