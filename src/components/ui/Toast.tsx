import React from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  X 
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore } from '../../stores/toastStore';
import type { Toast as ToastType } from '../../stores/toastStore';
import styles from './Toast.module.css';

const ICON_MAP = {
  success: <CheckCircle size={18} className={styles.iconSuccess} />,
  error: <AlertCircle size={18} className={styles.iconError} />,
  info: <Info size={18} className={styles.iconInfo} />,
  warning: <AlertTriangle size={18} className={styles.iconWarning} />
};

export const ToastItem: React.FC<{ toast: ToastType }> = ({ toast }) => {
  const removeToast = useToastStore(state => state.removeToast);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 10, transition: { duration: 0.15 } }}
      className={`${styles.toast} ${styles[toast.type]}`}
      role="alert"
    >
      <div className={styles.content}>
        {ICON_MAP[toast.type]}
        <span className={styles.message}>{toast.message}</span>
      </div>
      <button 
        className={styles.closeBtn} 
        onClick={() => removeToast(toast.id)}
        aria-label="Fechar notificação"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
};

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore(state => state.toasts);

  return (
    <div className={styles.container}>
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
