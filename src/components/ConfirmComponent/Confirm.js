import React from 'react';
import styles from './Confirm.module.css';

const ConfirmationDialog = ({ message, onConfirm, onCancel }) => {
  return (
    <div className={styles['dialog-overlay']} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <h1>Confirmación</h1>
        <p>{message}</p>
        <div className={styles.buttonContainer}>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancelar
          </button>
          <button className={styles.acceptButton} onClick={onConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
