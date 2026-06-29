/**
 * @file DatePicker.jsx
 * @description Date picker using date-fns for minimal size. 
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2026-05-04
 */
import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { format, parse, isValid, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import styles from './DatePicker.module.css';

export const DatePicker = ({
  selectedDate,
  onChange,
  placeholder = 'Select date',
  minDate,
  maxDate,
  className = '',
}) => {
  const getSafeDate = (d) => (d && !isNaN(new Date(d).getTime()) ? new Date(d) : null);
  const safeSelectedDate = getSafeDate(selectedDate);

  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(safeSelectedDate ? new Date(safeSelectedDate) : new Date());
  const [inputValue, setInputValue] = useState(safeSelectedDate ? format(safeSelectedDate, 'yyyy-MM-dd') : '');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const safeDate = getSafeDate(selectedDate);
    if (safeDate) {
      setInputValue(format(safeDate, 'yyyy-MM-dd'));
      setViewMonth(new Date(safeDate));
    } else {
      setInputValue('');
    }
  }, [selectedDate]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    const parsed = parse(val, 'yyyy-MM-dd', new Date());
    if (isValid(parsed)) {
      onChange(parsed);
    }
  };

  const handleDateSelect = (date) => {
    onChange(date);
    setInputValue(format(date, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(viewMonth),
    end: endOfMonth(viewMonth),
  });

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className={`${styles.container} ${className}`} ref={containerRef}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={styles.input}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && (
        <div className={styles.popup}>
          <div className={styles.header}>
            <button onClick={() => setViewMonth(subMonths(viewMonth, 1))}>←</button>
            <span>{format(viewMonth, 'MMMM yyyy')}</span>
            <button onClick={() => setViewMonth(addMonths(viewMonth, 1))}>→</button>
          </div>
          <div className={styles.weekdays}>
            {weekDays.map(day => (
              <div key={day} className={styles.weekday}>{day}</div>
            ))}
          </div>
          <div className={styles.days}>
            {daysInMonth.map(day => {
              const safeSelected = getSafeDate(selectedDate);
              const isSelected = safeSelected && isSameDay(day, safeSelected);
              const isDisabled = (minDate && day < minDate) || (maxDate && day > maxDate);
              return (
                <button
                  key={day.toString()}
                  className={`${styles.day} ${isSelected ? styles.selected : ''}`}
                  onClick={() => !isDisabled && handleDateSelect(day)}
                  disabled={isDisabled}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

DatePicker.propTypes = {
  selectedDate: PropTypes.instanceOf(Date),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  minDate: PropTypes.instanceOf(Date),
  maxDate: PropTypes.instanceOf(Date),
  className: PropTypes.string,
};