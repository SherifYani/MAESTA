import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useCallback,
} from "react";
import PropTypes from "prop-types";
import { createPortal } from "react-dom";
import "../../styles/components/form-components.css";

/**
 * Custom hook for handling date validation and calculation
 */
const useDateValidation = (minAge, maxAge) => {
  const calculateAge = useCallback((date) => {
    if (!date || isNaN(date.getTime())) return null;

    const today = new Date();
    today.setHours(12, 0, 0, 0);
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }

    return age;
  }, []);

  const validateDate = useCallback(
    (date) => {
      if (!date || isNaN(date.getTime())) {
        return { isValid: false, message: "Invalid date format", age: null };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (date > today) {
        return { isValid: false, message: "Date cannot be in the future", age: null };
      }

      const calculatedAge = calculateAge(date);

      if (calculatedAge < minAge) {
        return { isValid: false, message: `Must be at least ${minAge} years old`, age: calculatedAge };
      }

      if (calculatedAge > maxAge) {
        return { isValid: false, message: `Maximum age is ${maxAge} years`, age: calculatedAge };
      }

      return { isValid: true, message: "", age: calculatedAge };
    },
    [minAge, maxAge, calculateAge]
  );

  return { validateDate, calculateAge };
};

const formatDateToISO = (date) => {
  if (!date || isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateString = (dateString) => {
  if (!dateString || typeof dateString !== "string") return null;
  const parts = dateString.split("-");
  if (parts.length !== 3) return null;
  const [year, month, day] = parts.map(Number);

  if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) return null;

  // FIX #5: Safe Leap Year & Timezone handling
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
};

/**
 * DateInput Component
 */
function DateInput({
  icon = "fa-solid fa-calendar-days",
  name,
  placeholder = "DD / MM / YYYY",
  value,
  onChange,
  required = false,
  label = "Date of Birth",
  minAge = 16,
  maxAge = 100,
  showAge = true,
  className = "",
  hasError = false,
  errorMessage = "",
  dateFormat = "dd/mm/yyyy",
}) {
  const containerRef = useRef(null);
  const calendarRef = useRef(null);
  const calendarButtonRef = useRef(null);
  const dayInputRef = useRef(null);
  const monthInputRef = useRef(null);
  const yearInputRef = useRef(null);

  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState(null);
  const [age, setAge] = useState(null);
  const [isValid, setIsValid] = useState(true);
  const [localError, setLocalError] = useState("");

  // FIX #1: Ref to track if change is internal to prevent infinite clearing loop
  const isInternalChange = useRef(false);

  const { minDate, maxDate } = useMemo(() => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const min = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate(), 12, 0, 0, 0);
    const max = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate(), 12, 0, 0, 0);
    return { minDate: min, maxDate: max };
  }, [minAge, maxAge]);

  // Start at the latest valid birth date so the initial calendar month is selectable.
  const initialCalendarDate = useMemo(() => {
    if (value) {
      const parsed = parseDateString(value);
      if (parsed) return parsed;
    }
    return maxDate;
  }, [value, maxDate]);

  const [currentMonth, setCurrentMonth] = useState(initialCalendarDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialCalendarDate.getFullYear());

  useEffect(() => {
    if (value) {
      const parsed = parseDateString(value);
      if (parsed) {
        setCurrentMonth(parsed.getMonth());
        setCurrentYear(parsed.getFullYear());
      }
    }
  }, [value]);

  const { validateDate } = useDateValidation(minAge, maxAge);

  const createDateFromParts = useCallback((d, m, y) => {
    const dayNum = parseInt(d, 10);
    const monthNum = parseInt(m, 10);
    const yearNum = parseInt(y, 10);

    if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) return null;
    if (monthNum < 1 || monthNum > 12) return null;

    const date = new Date(yearNum, monthNum - 1, dayNum, 12, 0, 0, 0);
    if (date.getFullYear() !== yearNum || date.getMonth() !== monthNum - 1 || date.getDate() !== dayNum) {
      return null;
    }
    return date;
  }, []);

  // FIX #1: Infinite Clearing Bug Safeguard
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }

    if (value) {
      const date = parseDateString(value);
      if (date) {
        const newDay = date.getDate().toString().padStart(2, "0");
        const newMonth = (date.getMonth() + 1).toString().padStart(2, "0");
        const newYear = date.getFullYear().toString();

        if (newDay !== day || newMonth !== month || newYear !== year) {
          setDay(newDay);
          setMonth(newMonth);
          setYear(newYear);
        }
      }
    } else {
      if (day !== "" || month !== "" || year !== "") {
        setDay("");
        setMonth("");
        setYear("");
        setAge(null);
        setLocalError("");
        setIsValid(true);
      }
    }
  }, [value]);

  useEffect(() => {
    if (day && month && year) {
      const date = createDateFromParts(day, month, year);
      if (date) {
        const validation = validateDate(date);
        const isoDate = formatDateToISO(date);

        setIsValid(validation.isValid);
        setLocalError(validation.message);
        setAge(validation.age);

        if (onChange) {
          isInternalChange.current = true;
          onChange({
            target: { name, value: isoDate, isValid: validation.isValid, age: validation.age },
          });
        }
      } else {
        setIsValid(false);
        setLocalError("Invalid date");
        setAge(null);
        if (onChange) {
          isInternalChange.current = true;
          onChange({ target: { name, value: "", isValid: false, age: null } });
        }
      }
    } else {
      // Incomplete date: DO NOT trigger onChange with empty string to parent 
      // to prevent parent from clearing the value prop and wiping our inputs.
      setIsValid(false);
      setLocalError("");
      setAge(null);
    }
  }, [day, month, year, name, onChange, createDateFromParts, validateDate]);

  // FIX #2: Paste Crash (Optional chaining for nativeEvent)
  const handleDayChange = (e) => {
    let val = e.target.value.replace(/\D/g, "").substring(0, 2);
    setDay(val);
    if (val.length === 2 && monthInputRef.current) monthInputRef.current.focus();
  };

  const handleMonthChange = (e) => {
    let val = e.target.value.replace(/\D/g, "").substring(0, 2);
    if (val) {
      const monthNum = parseInt(val, 10);
      if (monthNum > 12) val = "12";
      else if (monthNum < 1 && val.length === 2) val = "01";
    }
    setMonth(val);
    if (val.length === 2 && yearInputRef.current) yearInputRef.current.focus();
    else if (!val && e.nativeEvent?.inputType === "deleteContentBackward" && dayInputRef.current) {
      dayInputRef.current.focus();
    }
  };

  const handleYearChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").substring(0, 4);
    setYear(val);
    if (!val && e.nativeEvent?.inputType === "deleteContentBackward" && monthInputRef.current) {
      monthInputRef.current.focus();
    }
  };

  const handleKeyDown = (e, inputType) => {
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        if (inputType === "month") dayInputRef.current?.focus();
        if (inputType === "year") monthInputRef.current?.focus();
        break;
      case "ArrowRight":
        e.preventDefault();
        if (inputType === "day") monthInputRef.current?.focus();
        if (inputType === "month") yearInputRef.current?.focus();
        break;
      case "Backspace":
        if (inputType === "month" && !month) dayInputRef.current?.focus();
        if (inputType === "year" && !year) monthInputRef.current?.focus();
        break;
      case "Escape":
        if (showCalendar) setShowCalendar(false);
        break;
      default:
        break;
    }
  };

  const handlePaste = (e, inputType) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").replace(/\D/g, "");
    if (pastedText.length >= 8) {
      let dayPart, monthPart, yearPart;
      if (dateFormat === "dd/mm/yyyy") {
        dayPart = pastedText.substring(0, 2);
        monthPart = pastedText.substring(2, 4);
        yearPart = pastedText.substring(4, 8);
      } else {
        monthPart = pastedText.substring(0, 2);
        dayPart = pastedText.substring(2, 4);
        yearPart = pastedText.substring(4, 8);
      }
      setDay(dayPart);
      setMonth(monthPart);
      setYear(yearPart);
      yearInputRef.current?.focus();
    } else {
      const target = e.target;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = target.value.substring(0, start) + pastedText + target.value.substring(end);

      // FIX #2: Create a synthetic event object that won't crash
      const syntheticEvent = {
        target: { value: newValue },
        nativeEvent: { inputType: "insertFromPaste" }
      };

      if (inputType === "day") handleDayChange(syntheticEvent);
      else if (inputType === "month") handleMonthChange(syntheticEvent);
      else handleYearChange(syntheticEvent);
    }
  };

  const handleClear = () => {
    setDay("");
    setMonth("");
    setYear("");
    setIsValid(true);
    setLocalError("");
    setAge(null);
    dayInputRef.current?.focus();

    if (onChange) {
      isInternalChange.current = true;
      onChange({ target: { name, value: "", isValid: false, age: null } });
    }
  };

  const handleCalendarToggle = () => {
    setShowCalendar(!showCalendar);
  };

  useLayoutEffect(() => {
    if (!showCalendar || !calendarRef.current || !containerRef.current) return;

    const updateCalendarPosition = () => {
      const containerRect = containerRef.current.getBoundingClientRect();
      const calendarHeight = calendarRef.current.offsetHeight;
      const viewportPadding = 8;
      const gap = 12;
      const width = Math.min(
        containerRect.width,
        window.innerWidth - viewportPadding * 2
      );
      const left = Math.max(
        viewportPadding,
        Math.min(
          containerRect.left,
          window.innerWidth - width - viewportPadding
        )
      );
      const availableBelow = Math.max(
        0,
        window.innerHeight -
          containerRect.bottom -
          gap -
          viewportPadding
      );
      const availableAbove = Math.max(
        0,
        containerRect.top - gap - viewportPadding
      );
      const placeAbove =
        availableBelow < calendarHeight && availableAbove > availableBelow;
      const maxHeight = Math.max(
        0,
        Math.min(
          placeAbove ? availableAbove : availableBelow,
          window.innerHeight - 120,
          480
        )
      );
      const top = placeAbove
        ? containerRect.top - maxHeight - gap
        : containerRect.bottom + gap;

      setCalendarPosition({ top, left, width, maxHeight });
    };

    updateCalendarPosition();
    window.addEventListener("resize", updateCalendarPosition);
    window.addEventListener("scroll", updateCalendarPosition, true);

    return () => {
      window.removeEventListener("resize", updateCalendarPosition);
      window.removeEventListener("scroll", updateCalendarPosition, true);
    };
  }, [showCalendar]);

  const handleDateSelect = (selectedDate) => {
    const validation = validateDate(selectedDate);
    setDay(selectedDate.getDate().toString().padStart(2, "0"));
    setMonth((selectedDate.getMonth() + 1).toString().padStart(2, "0"));
    setYear(selectedDate.getFullYear().toString());
    setIsValid(validation.isValid);
    setLocalError(validation.message);
    setAge(validation.age);
    setShowCalendar(false);
    calendarButtonRef.current?.focus(); // FIX #6: Restore focus to trigger
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // FIX #8 (NEW): Generate years array for dropdown selection
  const years = useMemo(() => {
    const startYear = minDate.getFullYear();
    const endYear = maxDate.getFullYear();
    const yearsArray = [];
    for (let i = endYear; i >= startYear; i--) {
      yearsArray.push(i);
    }
    return yearsArray;
  }, [minDate, maxDate]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    const days = [];
    for (let i = 0; i < startingDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(currentYear, currentMonth, i, 12, 0, 0, 0));
    return days;
  }, [currentMonth, currentYear]);

  const navigateMonth = (direction) => {
    if (direction === "prev") {
      if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
      else setCurrentMonth(currentMonth - 1);
    } else {
      if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
      else setCurrentMonth(currentMonth + 1);
    }
  };

  // FIX #4: Correct navigation disable logic
  const canGoPrev = useMemo(() => {
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastDayOfPrevMonth = new Date(prevYear, prevMonth + 1, 0, 12, 0, 0, 0);
    return lastDayOfPrevMonth >= minDate;
  }, [currentMonth, currentYear, minDate]);

  const canGoNext = useMemo(() => {
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const firstDayOfNextMonth = new Date(nextYear, nextMonth, 1, 12, 0, 0, 0);
    return firstDayOfNextMonth <= maxDate;
  }, [currentMonth, currentYear, maxDate]);

  const selectExampleDate = () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const exampleAge = Math.floor((minAge + maxAge) / 2);
    const exampleDate = new Date(today.getFullYear() - exampleAge, today.getMonth(), today.getDate(), 12, 0, 0, 0);
    if (exampleDate >= minDate && exampleDate <= maxDate) handleDateSelect(exampleDate);
  };

  // FIX #6: Focus Trap & Accessibility
  useEffect(() => {
    if (!showCalendar) return;

    const focusableElements = calendarRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements?.[0];
    const lastFocusable = focusableElements?.[focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable?.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable?.focus();
          }
        }
      }
    };

    calendarRef.current?.addEventListener("keydown", handleKeyDown);
    firstFocusable?.focus();

    return () => {
      calendarRef.current?.removeEventListener("keydown", handleKeyDown);
    };
  }, [showCalendar]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current && !containerRef.current.contains(event.target) &&
        calendarRef.current && !calendarRef.current.contains(event.target)
      ) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const containerClass = `date-input__container ${className} ${hasError || !isValid ? "date-input--error" : ""}`.trim();

  return (
    <div className={containerClass} ref={containerRef}>
      {label && (
        <label className="date-input__label" htmlFor={`${name}-day`}>
          {label}
          {required && <span className="date-input__required" aria-hidden="true">*</span>}
        </label>
      )}

      <span id={`${name}-description`} className="sr-only">
        Enter date in {dateFormat === "dd/mm/yyyy" ? "day month year" : "month day year"} format
      </span>

      <div className="date-input__fields-wrapper">
        <i className={`${icon} form-input__icon date-input__icon`} aria-hidden="true" />

        <div className="date-input__fields">
          <input ref={dayInputRef} id={`${name}-day`} type="text" value={day} onChange={handleDayChange} onKeyDown={(e) => handleKeyDown(e, "day")} onPaste={(e) => handlePaste(e, "day")} placeholder="DD" maxLength={2} inputMode="numeric" className="date-input__part" aria-label="Day" aria-describedby={`${name}-description ${name}-feedback`} />
          <span className="date-input__separator" aria-hidden="true">/</span>
          <input ref={monthInputRef} type="text" value={month} onChange={handleMonthChange} onKeyDown={(e) => handleKeyDown(e, "month")} onPaste={(e) => handlePaste(e, "month")} placeholder="MM" maxLength={2} inputMode="numeric" className="date-input__part" aria-label="Month" />
          <span className="date-input__separator" aria-hidden="true">/</span>
          <input ref={yearInputRef} type="text" value={year} onChange={handleYearChange} onKeyDown={(e) => handleKeyDown(e, "year")} onPaste={(e) => handlePaste(e, "year")} placeholder="YYYY" maxLength={4} inputMode="numeric" className="date-input__part" aria-label="Year" />
        </div>

        <div className="date-input__actions">
          {(day || month || year) && (
            <button type="button" onClick={handleClear} className="date-input__clear-button" aria-label="Clear date">
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          )}
          <button ref={calendarButtonRef} type="button" onClick={handleCalendarToggle} className="date-input__calendar-button" aria-label={showCalendar ? "Close calendar" : "Open calendar"} aria-expanded={showCalendar} aria-controls={`${name}-calendar`}>
            <i className={`fa-solid ${showCalendar ? "fa-calendar-xmark" : "fa-calendar-alt"}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div id={`${name}-feedback`} className="date-input__feedback">
        {showAge && age !== null && isValid && !hasError && day && month && year && (
          <div className="date-input__age-display">
            <i className="fa-solid fa-cake-candles" aria-hidden="true" />
            <span className="date-input__age-text">Age: {age} years</span>
          </div>
        )}
        {(hasError || !isValid) && localError && (
          <div className="date-input__error-message" role="alert">
            <i className="fa-solid fa-exclamation-triangle" aria-hidden="true" />
            <span>{errorMessage || localError}</span>
          </div>
        )}
      </div>

      {showCalendar &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="date-input__calendar-popup"
            ref={calendarRef}
            id={`${name}-calendar`}
            role="dialog"
            aria-label="Select date"
            aria-modal="true"
            style={{
              top: calendarPosition?.top ?? 0,
              left: calendarPosition?.left ?? 0,
              width: calendarPosition?.width ?? "100%",
              maxHeight: calendarPosition?.maxHeight,
            }}
          >
          <div className="date-input__calendar-header">
            <h4>Select Date</h4>
            <button type="button" onClick={() => setShowCalendar(false)} className="date-input__calendar-close" aria-label="Close calendar">
              <i className="fa-solid fa-times" aria-hidden="true" />
            </button>
          </div>

          <div className="date-input__calendar-body">
            <div className="date-input__month-selector">
              <button type="button" className="date-input__month-nav" onClick={() => navigateMonth("prev")} disabled={!canGoPrev} aria-label="Previous month">
                <i className="fa-solid fa-chevron-left" aria-hidden="true" />
              </button>

              {/* Month & Year Selectors with custom chevron arrows */}
              <div className="date-input__calendar-header-selectors">
                <div className="date-input__select-wrapper">
                  <select
                    value={currentMonth}
                    onChange={(e) => setCurrentMonth(Number(e.target.value))}
                    aria-label="Select month"
                    className="date-input__select date-input__month-select"
                  >
                    {monthNames.map((name, index) => (
                      <option key={index} value={index}>{name}</option>
                    ))}
                  </select>
                  <i className="fa-solid fa-chevron-down date-input__select-arrow" aria-hidden="true" />
                </div>

                <div className="date-input__select-wrapper">
                  <select
                    value={currentYear}
                    onChange={(e) => setCurrentYear(Number(e.target.value))}
                    aria-label="Select year"
                    className="date-input__select date-input__year-select"
                  >
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <i className="fa-solid fa-chevron-down date-input__select-arrow" aria-hidden="true" />
                </div>
              </div>

              <button type="button" className="date-input__month-nav" onClick={() => navigateMonth("next")} disabled={!canGoNext} aria-label="Next month">
                <i className="fa-solid fa-chevron-right" aria-hidden="true" />
              </button>
            </div>

            <div className="date-input__calendar-grid">
              {dayNames.map((dayName) => (
                <div key={dayName} className="date-input__calendar-day-header">{dayName}</div>
              ))}
              {calendarDays.map((date, index) => {
                if (!date) return <div key={`empty-${index}`} className="date-input__calendar-day-empty" aria-hidden="true" />;
                const dayNum = date.getDate();
                const monthNum = date.getMonth();
                const yearNum = date.getFullYear();
                const isSelectable = date >= minDate && date <= maxDate;
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <button
                    key={`${yearNum}-${monthNum}-${dayNum}`}
                    type="button"
                    className={`date-input__calendar-day ${!isSelectable ? "date-input__calendar-day--disabled" : ""} ${isToday ? "date-input__calendar-day--today" : ""}`}
                    onClick={() => isSelectable && handleDateSelect(date)}
                    disabled={!isSelectable}
                    aria-label={`Select ${monthNames[monthNum]} ${dayNum}, ${yearNum}`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>

            <div className="date-input__calendar-actions">
              <button type="button" className="date-input__calendar-action" onClick={selectExampleDate}>
                <i className="fa-solid fa-bolt" aria-hidden="true" />
                Quick Fill (Age {Math.floor((minAge + maxAge) / 2)})
              </button>
              <button type="button" className="date-input__calendar-action" onClick={handleClear}>
                <i className="fa-solid fa-eraser" aria-hidden="true" />
                Clear Date
              </button>
            </div>
          </div>
          </div>,
          document.body
        )}
    </div>
  );
}

DateInput.propTypes = {
  icon: PropTypes.string,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  label: PropTypes.string,
  minAge: PropTypes.number,
  maxAge: PropTypes.number,
  showAge: PropTypes.bool,
  className: PropTypes.string,
  hasError: PropTypes.bool,
  errorMessage: PropTypes.string,
  dateFormat: PropTypes.oneOf(["dd/mm/yyyy", "mm/dd/yyyy"]),
};

export default DateInput;