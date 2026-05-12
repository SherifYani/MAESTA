/**
 * @file TableRow.jsx
 * @description Single table row component.
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2026-05-04
 */
import React from 'react';
import PropTypes from 'prop-types';
import styles from './DataTable.module.css';

export const TableRow = ({ row, columns, onRowClick, isSelected, renderCell }) => {
  const handleClick = (e) => {
    if (onRowClick && !e.target.closest('.action-cell')) {
      onRowClick(row);
    }
  };

  return (
    <tr
      className={`${styles.row} ${isSelected ? styles.selected : ''} ${onRowClick ? styles.clickable : ''}`}
      onClick={handleClick}
    >
      {columns.map((col) => (
        <td key={col.key} className={styles.cell}>
          {renderCell ? renderCell(col.key, row[col.key], row) : row[col.key]}
        </td>
      ))}
    </tr>
  );
};

TableRow.propTypes = {
  row: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  onRowClick: PropTypes.func,
  isSelected: PropTypes.bool,
  renderCell: PropTypes.func,
};