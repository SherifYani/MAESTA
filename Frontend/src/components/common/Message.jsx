/**
 * @file Message.jsx
 * @description Success and error message banners with auto-dismiss.
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2026-05-04
*/
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Message.module.css';

export const SuccessMessage = ({ message, onDismiss, autoDismiss = 5000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoDismiss > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onDismiss) onDismiss();
      }, autoDismiss);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onDismiss]);

  if (!visible || !message) return null;

  return (
    <div className={styles.success}>
      <span>{message}</span>
      <button onClick={() => { setVisible(false); if (onDismiss) onDismiss(); }} className={styles.dismiss}>×</button>
    </div>
  );
};

export const ErrorMessage = ({ message, onDismiss, autoDismiss = 5000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoDismiss > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onDismiss) onDismiss();
      }, autoDismiss);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onDismiss]);

  if (!visible || !message) return null;

  return (
    <div className={styles.error}>
      <span>{message}</span>
      <button onClick={() => { setVisible(false); if (onDismiss) onDismiss(); }} className={styles.dismiss}>×</button>
    </div>
  );
};

SuccessMessage.propTypes = {
  message: PropTypes.string,
  onDismiss: PropTypes.func,
  autoDismiss: PropTypes.number,
};

ErrorMessage.propTypes = {
  message: PropTypes.string,
  onDismiss: PropTypes.func,
  autoDismiss: PropTypes.number,
};