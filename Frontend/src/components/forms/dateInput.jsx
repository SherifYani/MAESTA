/**
 * @file DateInput.jsx
 * @description Custom date input component with intuitive input and easy editing
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 01-12-2025
 *
 */

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import "../../styles/components/form-components.css";

/**
 * Custom hook for handling date validation and calculation
 * @param {number} minAge - Minimum age allowed
 * @param {number} maxAge - Maximum age allowed
 * @returns {Object} Validation utilities
 */
const useDateValidation = (minAge, maxAge) => {
  const { t } = useTranslation(['validation']);
  const calculateAge = useCallback((date) => {
    if (!date || isNaN(date.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < date.getDate())
    ) {
      age--;
    }

    return age;
  }, []);

  const validateDate = useCallback(
    (date) => {
      if (!date || isNaN(date.getTime())) {
        return { isValid: false, message: t('validation:dateInput.invalidFormat', "Invalid date format"), age: null };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (date > today) {
        return {
          isValid: false,
          message: t('validation:dateInput.futureDate', "Date cannot be in the future"),
          age: null,
        };
      }

      const calculatedAge = calculateAge(date);

      if (calculatedAge < minAge) {
        return {
          isValid: false,
          message: t('validation:dateInput.minAge', "Must be at least {{minAge}} years old", { minAge }),
          age: calculatedAge,
        };
      }

      if (calculatedAge > maxAge) {
        return {
          isValid: false,
          message: t('validation:dateInput.maxAge', "Maximum age is {{maxAge}} years", { maxAge }),
          age: calculatedAge,
        };
      }

      return { isValid: true, message: "", age: calculatedAge };
    },
    [minAge, maxAge, calculateAge, t]
  );

  return { validateDate, calculateAge };
};

/**
 * Format date to YYYY-MM-DD string (ISO format without time)
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string
 */
const formatDateToISO = (date) => {
  if (!date || isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * Parse date string to Date object
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {Date|null} Parsed Date object or null
 */
const parseDateString = (dateString) => {
  if (!dateString) return null;

  // Parse ISO date string (YYYY-MM-DD)
  const [year, month, day] = dateString.split("-").map(Number);

  if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) {
    return null;
  }

  // Create date in local timezone (set to noon to avoid timezone issues)
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);

  // Validate the date (handles invalid dates like February 30)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

/**
 * DateInput Component
 * @description Renders a user-friendly date input with easy editing and calendar selection
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
  const { t } = useTranslation(['validation', 'common']);
  // Refs
  const containerRef = useRef(null);
  const calendarRef = useRef(null);
  const dayInputRef = useRef(null);
  const monthInputRef = useRef(null);
  const yearInputRef = useRef(null);

  // State
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [age, setAge] = useState(null);
  const [isValid, setIsValid] = useState(true);
  const [localError, setLocalError] = useState("");

  // Calculate min and max dates
  const { minDate, maxDate } = useMemo(() => {
    const today = new Date();
    today.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

    const min = new Date(today);
    min.setFullYear(today.getFullYear() - maxAge);

    const max = new Date(today);
    max.setFullYear(today.getFullYear() - minAge);

    return { minDate: min, maxDate: max };
  }, [minAge, maxAge]);

  // Initialize from value prop
  useEffect(() => {
    if (value) {
      const date = parseDateString(value);
      if (date) {
        setDay(date.getDate().toString().padStart(2, "0"));
        setMonth((date.getMonth() + 1).toString().padStart(2, "0"));
        setYear(date.getFullYear().toString());
      }
    } else {
      setDay("");
      setMonth("");
      setYear("");
    }
  }, [value]);

  // Date validation hook
  const { validateDate } = useDateValidation(minAge, maxAge);

  // Create Date object from parts
  const createDateFromParts = useCallback((d, m, y) => {
    const dayNum = parseInt(d, 10);
    const monthNum = parseInt(m, 10);
    const yearNum = parseInt(y, 10);

    if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
      return null;
    }

    // Validate month
    if (monthNum < 1 || monthNum > 12) {
      return null;
    }

    // Create date in local timezone (set to noon)
    const date = new Date(yearNum, monthNum - 1, dayNum, 12, 0, 0, 0);

    // Validate the date (handles invalid dates like February 30)
    if (
      date.getFullYear() !== yearNum ||
      date.getMonth() !== monthNum - 1 ||
      date.getDate() !== dayNum
    ) {
      return null;
    }

    return date;
  }, []);

  // Validate and update when parts change
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
          onChange({
            target: {
              name,
              value: isoDate,
              isValid: validation.isValid,
              age: validation.age,
            },
          });
        }
      } else {
        setIsValid(false);
        setLocalError(t('validation:dateInput.invalidDate', "Invalid date"));
        setAge(null);

        if (onChange) {
          onChange({
            target: {
              name,
              value: "",
              isValid: false,
              age: null,
            },
          });
        }
      }
    } else if (onChange) {
      // Partial or empty date
      onChange({
        target: {
          name,
          value: "",
          isValid: false,
          age: null,
        },
      });
    }
  }, [day, month, year, name, onChange, createDateFromParts, validateDate]);

  // Handle day input
  const handleDayChange = (e) => {
    let value = e.target.value.replace(/\D/g, "").substring(0, 2);
    setDay(value);

    if (value.length === 2 && monthInputRef.current) {
      monthInputRef.current.focus();
    }
  };

  // Handle month input
  const handleMonthChange = (e) => {
    let value = e.target.value.replace(/\D/g, "").substring(0, 2);

    // Validate month range
    if (value) {
      const monthNum = parseInt(value, 10);
      if (monthNum > 12) {
        value = "12";
      } else if (monthNum < 1 && value.length === 2) {
        value = "01";
      }
    }

    setMonth(value);

    if (value.length === 2 && yearInputRef.current) {
      yearInputRef.current.focus();
    } else if (
      !value &&
      e.nativeEvent.inputType === "deleteContentBackward" &&
      dayInputRef.current
    ) {
      dayInputRef.current.focus();
    }
  };

  // Handle year input
  const handleYearChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 4);
    setYear(value);

    if (
      !value &&
      e.nativeEvent.inputType === "deleteContentBackward" &&
      monthInputRef.current
    ) {
      monthInputRef.current.focus();
    }
  };

  // Handle keyboard navigation
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
        if (inputType === "month" && !month) {
          dayInputRef.current?.focus();
        }
        if (inputType === "year" && !year) {
          monthInputRef.current?.focus();
        }
        break;
      case "Escape":
        if (showCalendar) setShowCalendar(false);
        break;
      default:
        break;
    }
  };

  // Handle paste
  const handlePaste = (e, inputType) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").replace(/\D/g, "");

    if (pastedText.length >= 8) {
      // Full date pasted (DDMMYYYY or MMDDYYYY)
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
      // Partial paste
      const target = e.target;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue =
        target.value.substring(0, start) +
        pastedText +
        target.value.substring(end);

      if (inputType === "day") handleDayChange({ target: { value: newValue } });
      else if (inputType === "month")
        handleMonthChange({ target: { value: newValue } });
      else handleYearChange({ target: { value: newValue } });
    }
  };

  // Clear all inputs
  const handleClear = () => {
    setDay("");
    setMonth("");
    setYear("");
    setIsValid(true);
    setLocalError("");
    setAge(null);
    dayInputRef.current?.focus();

    if (onChange) {
      onChange({
        target: {
          name,
          value: "",
          isValid: false,
          age: null,
        },
      });
    }
  };

  // Handle calendar toggle
  const handleCalendarToggle = () => {
    setShowCalendar(!showCalendar);
  };

  // Handle date selection from calendar
  const handleDateSelect = (selectedDate) => {
    const isoDate = formatDateToISO(selectedDate);

    if (onChange) {
      const validation = validateDate(selectedDate);

      onChange({
        target: {
          name,
          value: isoDate,
          isValid: validation.isValid,
          age: validation.age,
        },
      });
    }

    setShowCalendar(false);
    yearInputRef.current?.focus();
  };

  // Calendar configuration
  const [currentMonth, setCurrentMonth] = useState(minDate.getMonth());
  const [currentYear, setCurrentYear] = useState(minDate.getFullYear());

  const monthNames = [
    t('common:months.january', "January"),
    t('common:months.february', "February"),
    t('common:months.march', "March"),
    t('common:months.april', "April"),
    t('common:months.may', "May"),
    t('common:months.june', "June"),
    t('common:months.july', "July"),
    t('common:months.august', "August"),
    t('common:months.september', "September"),
    t('common:months.october', "October"),
    t('common:months.november', "November"),
    t('common:months.december', "December"),
  ];

  const dayNames = [
    t('common:days.sun', "Sun"),
    t('common:days.mon', "Mon"),
    t('common:days.tue', "Tue"),
    t('common:days.wed', "Wed"),
    t('common:days.thu', "Thu"),
    t('common:days.fri', "Fri"),
    t('common:days.sat', "Sat")
  ];

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];

    // Empty days for previous month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentYear, currentMonth, i, 12, 0, 0, 0));
    }

    return days;
  }, [currentMonth, currentYear]);

  // Navigation between months
  const navigateMonth = (direction) => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  // Check navigation buttons
  const canGoPrev = useMemo(() => {
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const firstDayOfPrevMonth = new Date(prevYear, prevMonth, 1, 12, 0, 0, 0);
    return firstDayOfPrevMonth >= minDate;
  }, [currentMonth, currentYear, minDate]);

  const canGoNext = useMemo(() => {
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const firstDayOfNextMonth = new Date(nextYear, nextMonth, 1, 12, 0, 0, 0);
    return firstDayOfNextMonth <= maxDate;
  }, [currentMonth, currentYear, maxDate]);

  // Select example date
  const selectExampleDate = () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const exampleAge = Math.floor((minAge + maxAge) / 2);
    const exampleDate = new Date(
      today.getFullYear() - exampleAge,
      today.getMonth(),
      today.getDate(),
      12,
      0,
      0,
      0
    );

    if (exampleDate >= minDate && exampleDate <= maxDate) {
      handleDateSelect(exampleDate);
    }
  };

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        calendarRef.current &&
        !calendarRef.current.contains(event.target)
      ) {
        setShowCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const containerClass = `date-input__container ${className} ${
    hasError || !isValid ? "date-input--error" : ""
  }`.trim();

  return (
    <div className={containerClass} ref={containerRef}>
      {label && (
        <label className="date-input__label" htmlFor={`${name}-day`}>
          {label}
          {required && (
            <span className="date-input__required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <span id={`${name}-description`} className="sr-only">
        {t('common:dateInput.formatDescription', "Enter date in {{format}} format", { format: dateFormat === "dd/mm/yyyy" ? "day month year" : "month day year" })}
      </span>

      <div className="date-input__fields-wrapper">
        <i
          className={`${icon} form-input__icon date-input__icon`}
          aria-hidden="true"
        />

        <div className="date-input__fields">
          <input
            ref={dayInputRef}
            id={`${name}-day`}
            type="text"
            value={day}
            onChange={handleDayChange}
            onKeyDown={(e) => handleKeyDown(e, "day")}
            onPaste={(e) => handlePaste(e, "day")}
            placeholder="DD"
            maxLength={2}
            inputMode="numeric"
            className="date-input__part"
            aria-label={t('common:dateInput.day', "Day")}
            aria-describedby={`${name}-description ${name}-feedback`}
          />

          <span className="date-input__separator" aria-hidden="true">
            /
          </span>

          <input
            ref={monthInputRef}
            type="text"
            value={month}
            onChange={handleMonthChange}
            onKeyDown={(e) => handleKeyDown(e, "month")}
            onPaste={(e) => handlePaste(e, "month")}
            placeholder="MM"
            maxLength={2}
            inputMode="numeric"
            className="date-input__part"
            aria-label={t('common:dateInput.month', "Month")}
          />

          <span className="date-input__separator" aria-hidden="true">
            /
          </span>

          <input
            ref={yearInputRef}
            type="text"
            value={year}
            onChange={handleYearChange}
            onKeyDown={(e) => handleKeyDown(e, "year")}
            onPaste={(e) => handlePaste(e, "year")}
            placeholder="YYYY"
            maxLength={4}
            inputMode="numeric"
            className="date-input__part"
            aria-label={t('common:dateInput.year', "Year")}
          />
        </div>

        <div className="date-input__actions">
          {(day || month || year) && (
            <button
              type="button"
              onClick={handleClear}
              className="date-input__clear-button"
              aria-label={t('common:actions.clearDate', "Clear date")}>
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          )}

          <button
            type="button"
            onClick={handleCalendarToggle}
            className="date-input__calendar-button"
            aria-label={showCalendar ? t('common:actions.closeCalendar', "Close calendar") : t('common:actions.openCalendar', "Open calendar")}
            aria-expanded={showCalendar}
            aria-controls={`${name}-calendar`}>
            <i
              className={`fa-solid ${
                showCalendar ? "fa-calendar-xmark" : "fa-calendar-alt"
              }`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <div id={`${name}-feedback`} className="date-input__feedback">
        {showAge &&
          age !== null &&
          isValid &&
          !hasError &&
          day &&
          month &&
          year && (
            <div className="date-input__age-display">
              <i className="fa-solid fa-cake-candles" aria-hidden="true" />
              <span className="date-input__age-text">{t('common:dateInput.ageDisplay', "Age: {{age}} years", { age })}</span>
            </div>
          )}

        {(hasError || !isValid) && (
          <div className="date-input__error-message" role="alert">
            <i
              className="fa-solid fa-exclamation-triangle"
              aria-hidden="true"
            />
            <span>{errorMessage || localError}</span>
          </div>
        )}

        <div className="date-input__tips">
          <i className="fa-solid fa-lightbulb" aria-hidden="true" />
          <span>
            {t('common:dateInput.tip', "Tip: Use Tab to navigate • Paste full date • Click X to clear")}
          </span>
        </div>
      </div>

      {showCalendar && (
        <div
          className="date-input__calendar-popup"
          ref={calendarRef}
          id={`${name}-calendar`}
          role="dialog"
          aria-label={t('common:dateInput.selectDate', "Select date")}
          aria-modal="true">
          <div className="date-input__calendar-header">
            <h4>{t('common:dateInput.selectDate', "Select Date")}</h4>
            <button
              type="button"
              onClick={() => setShowCalendar(false)}
              className="date-input__calendar-close"
              aria-label={t('common:actions.closeCalendar', "Close calendar")}>
              <i className="fa-solid fa-times" aria-hidden="true" />
            </button>
          </div>

          <div className="date-input__calendar-body">
            <div className="date-input__month-selector">
              <button
                type="button"
                className="date-input__month-nav"
                onClick={() => navigateMonth("prev")}
                disabled={!canGoPrev}
                aria-label={t('common:actions.prevMonth', "Previous month")}>
                <i className="fa-solid fa-chevron-left" aria-hidden="true" />
              </button>

              <span className="date-input__current-month">
                {monthNames[currentMonth]} {currentYear}
              </span>

              <button
                type="button"
                className="date-input__month-nav"
                onClick={() => navigateMonth("next")}
                disabled={!canGoNext}
                aria-label={t('common:actions.nextMonth', "Next month")}>
                <i className="fa-solid fa-chevron-right" aria-hidden="true" />
              </button>
            </div>

            <div className="date-input__calendar-grid">
              {dayNames.map((dayName) => (
                <div key={dayName} className="date-input__calendar-day-header">
                  {dayName}
                </div>
              ))}

              {calendarDays.map((date, index) => {
                if (!date) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="date-input__calendar-day-empty"
                      aria-hidden="true"
                    />
                  );
                }

                const dayNum = date.getDate();
                const monthNum = date.getMonth();
                const yearNum = date.getFullYear();

                const isSelectable = date >= minDate && date <= maxDate;
                const isToday =
                  date.toDateString() === new Date().toDateString();

                return (
                  <button
                    key={`${yearNum}-${monthNum}-${dayNum}`}
                    type="button"
                    className={`date-input__calendar-day ${
                      !isSelectable ? "date-input__calendar-day--disabled" : ""
                    } ${isToday ? "date-input__calendar-day--today" : ""}`}
                    onClick={() => isSelectable && handleDateSelect(date)}
                    disabled={!isSelectable}
                    aria-label={t('common:dateInput.selectDay', "Select {{month}} {{day}}, {{year}}", { month: monthNames[monthNum], day: dayNum, year: yearNum })}>
                    {dayNum}
                  </button>
                );
              })}
            </div>

            <div className="date-input__calendar-actions">
              <button
                type="button"
                className="date-input__calendar-action"
                onClick={selectExampleDate}>
                <i className="fa-solid fa-bolt" aria-hidden="true" />
                {t('common:dateInput.quickFill', "Quick Fill (Age {{age}})", { age: Math.floor((minAge + maxAge) / 2) })}
              </button>

              <button
                type="button"
                className="date-input__calendar-action"
                onClick={handleClear}>
                <i className="fa-solid fa-eraser" aria-hidden="true" />
                Clear Date
              </button>
            </div>
          </div>
        </div>
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

DateInput.defaultProps = {
  icon: "fa-solid fa-calendar-days",
  placeholder: "DD / MM / YYYY",
  required: false,
  label: "Date of Birth",
  minAge: 16,
  maxAge: 100,
  showAge: true,
  className: "",
  hasError: false,
  errorMessage: "",
  dateFormat: "dd/mm/yyyy",
};

export default DateInput;
