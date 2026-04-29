import { useState, useEffect } from 'react';

export default function Toast({ message, type = 'success' }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(t);
  }, []);
  if (!visible) return null;
  return <div className={`toast toast--${type}`}>{message}</div>;
}
