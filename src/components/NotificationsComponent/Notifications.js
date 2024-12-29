import React from 'react';
import styles from './Notifications.module.css';

const Notification = ({ message, type, onConfirm }) => {
  if (!message) return null;

  return (
    <div className={styles['notification-overlay']} onClick={onConfirm}>
      <div className={`${styles.notification} ${styles[type]}`} onClick={(e) => e.stopPropagation()}>
        <h1>{type}</h1>
        <p>{message}</p>
        <button className={styles.acceptButton} onClick={onConfirm}>
          Aceptar
        </button>
      </div>
    </div>
  );
};

export default Notification;
