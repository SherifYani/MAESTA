/**
 * @file DataTable.jsx
 * @description Complete data table with sorting, selection, and custom rendering.
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2026-05-04
*/
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TableHeader } from './TableHeader';
import { TableRow } from './TableRow';
import styles from './DataTable.module.css';

export const DataTable = ({
  data,
  columns,
  keyField = 'id',
  onRowClick,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  sortable = false,
  onSort,
  renderCell,
  emptyMessage = 'No data available',
}) => {
  const [internalSortColumn, setInternalSortColumn] = useState(null);
  const [internalSortDirection, setInternalSortDirection] = useState('asc');

  const handleSort = (columnKey) => {
    if (!sortable) return;
    let newDirection = 'asc';
    if (internalSortColumn === columnKey && internalSortDirection === 'asc') {
      newDirection = 'desc';
    }
    setInternalSortColumn(columnKey);
    setInternalSortDirection(newDirection);
    if (onSort) {
      onSort(columnKey, newDirection);
    }
  };

  const handleSelectAll = (e) => {
    if (!onSelectionChange) return;
    const checked = e.target.checked;
    const allKeys = data.map(item => item[keyField]);
    onSelectionChange(checked ? allKeys : []);
  };

  const handleSelectRow = (rowKey) => {
    if (!onSelectionChange) return;
    const newSelected = selectedKeys.includes(rowKey)
      ? selectedKeys.filter(k => k !== rowKey)
      : [...selectedKeys, rowKey];
    onSelectionChange(newSelected);
  };

  const allSelected = selectable && data.length > 0 && selectedKeys.length === data.length;
  const someSelected = selectable && selectedKeys.length > 0 && selectedKeys.length < data.length;

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        {selectable && (
          <colgroup>
            <col style={{ width: '40px' }} />
            {columns.map((col, idx) => (
              <col key={idx} style={{ width: col.width }} />
            ))}
          </colgroup>
        )}
        <TableHeader
          columns={selectable ? [{ key: '_selector', label: '', sortable: false }, ...columns] : columns}
          sortColumn={internalSortColumn}
          sortDirection={internalSortDirection}
          onSort={handleSort}
        />
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className={styles.emptyMessage}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row[keyField]} className={styles.row}>
                {selectable && (
                  <td className={styles.checkboxCell}>
                    <input
                      type="checkbox"
                      checked={selectedKeys.includes(row[keyField])}
                      onChange={() => handleSelectRow(row[keyField])}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className={styles.cell}>
                    {renderCell ? renderCell(col.key, row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {selectable && data.length > 0 && (
        <div className={styles.selectionInfo}>
          <label className={styles.selectAllLabel}>
            <input
              type="checkbox"
              checked={allSelected}
              ref={input => input && (input.indeterminate = someSelected)}
              onChange={handleSelectAll}
            />
            Select All
          </label>
        </div>
      )}
    </div>
  );
};

DataTable.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  keyField: PropTypes.string,
  onRowClick: PropTypes.func,
  selectable: PropTypes.bool,
  selectedKeys: PropTypes.array,
  onSelectionChange: PropTypes.func,
  sortable: PropTypes.bool,
  onSort: PropTypes.func,
  renderCell: PropTypes.func,
  emptyMessage: PropTypes.string,
};