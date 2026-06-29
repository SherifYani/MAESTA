/**
 * @file FilterPanel.jsx
 * @description Flexible filter panel with multiple filter types (select, date range, search).
 * Uses GeneralSelect for select inputs to match project design system.
 * @author Sherif Talaat
 * @version 1.1.0
 * @date 2026-05-04
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from './Button';
import { Input } from './Input';
import { DatePicker } from './DatePicker';
import GeneralSelect from './GeneralSelect';
import styles from './FilterPanel.module.css';

// Empty icon component for GeneralSelect when no icon needed
const EmptyIcon = () => null;

export const FilterPanel = ({
  filters,
  onApply,
  onReset,
  showReset = true,
  className = '',
}) => {
  // Derive initial values from the config object (not the config itself)
  const deriveValues = (config) =>
    Object.entries(config).reduce((acc, [key, cfg]) => {
      if (cfg.type === 'select' && cfg.options?.length > 0) acc[key] = cfg.options[0].value;
      else if (cfg.type === 'dateRange') acc[key] = { start: '', end: '' };
      else acc[key] = '';
      return acc;
    }, {});

  const [localFilters, setLocalFilters] = useState(() => deriveValues(filters));


  const handleChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleReset = () => {
    const resetValues = deriveValues(filters);
    setLocalFilters(resetValues);
    if (onReset) onReset(resetValues);
  };


  const renderFilterInput = (key, config) => {
    const value = localFilters[key];
    switch (config.type) {
      case 'select':
        return (
          <GeneralSelect
            value={value || ''}
            onChange={(newValue) => handleChange(key, newValue)}
            options={config.options}
            placeholder={config.placeholder || 'Select...'}
            label={config.label}
            icon={EmptyIcon}
          />
        );
      case 'date':
        return (
          <DatePicker
            selectedDate={value ? new Date(value) : null}
            onChange={(date) => handleChange(key, date ? date.toISOString().split('T')[0] : '')}
            placeholder={config.placeholder}
          />
        );
      case 'dateRange':
        return (
          <div className={styles.dateRange}>
            <DatePicker
              selectedDate={value?.start ? new Date(value.start) : null}
              onChange={(date) => handleChange(key, { ...value, start: date ? date.toISOString().split('T')[0] : '' })}
              placeholder="Start date"
            />
            <span>to</span>
            <DatePicker
              selectedDate={value?.end ? new Date(value.end) : null}
              onChange={(date) => handleChange(key, { ...value, end: date ? date.toISOString().split('T')[0] : '' })}
              placeholder="End date"
            />
          </div>
        );
      case 'search':
      default:
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={config.placeholder || 'Search...'}
          />
        );
    }
  };

  return (
    <div className={`${styles.filterPanel} ${className}`}>
      <div className={styles.filtersGrid}>
        {Object.entries(filters).map(([key, config]) => (
          <div key={key} className={styles.filterItem}>
            <label className={styles.label}>{config.label}</label>
            {renderFilterInput(key, config)}
          </div>
        ))}
      </div>
      <div className={styles.actions}>
        <Button variant="primary" size="small" onClick={handleApply}>
          Apply Filters
        </Button>
        {showReset && (
          <Button variant="outline" size="small" onClick={handleReset}>
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};

FilterPanel.propTypes = {
  filters: PropTypes.objectOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['select', 'date', 'dateRange', 'search']),
      placeholder: PropTypes.string,
      options: PropTypes.arrayOf(
        PropTypes.shape({ value: PropTypes.string, label: PropTypes.string })
      ),
    })
  ).isRequired,
  onApply: PropTypes.func.isRequired,
  onReset: PropTypes.func,
  showReset: PropTypes.bool,
  className: PropTypes.string,
};