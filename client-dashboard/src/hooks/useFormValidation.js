import { useState, useCallback } from 'react';

/**
 * Lightweight real-time form validation hook.
 * 
 * Usage:
 *   const { touched, errors, touchField, validate, resetValidation } = useFormValidation();
 *   
 *   // On blur:  onBlur={() => touchField('name', value, { required: true })}
 *   // On submit: if (!validate(form, rules)) return;
 *   // In JSX:   className={`form-group ${errors.name ? 'form-group--error' : ''}`}
 *   //           {errors.name && <span className="form-error">{errors.name}</span>}
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-\s()]*$/;

function validateField(value, rules) {
  if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return 'This field is required';
  }
  if (value && rules.email && typeof value === 'string' && value.trim() && !EMAIL_RE.test(value)) {
    return 'Please enter a valid email';
  }
  if (value && rules.phone && typeof value === 'string' && value.trim() && !PHONE_RE.test(value)) {
    return 'Phone must contain only numbers';
  }
  return null;
}

export default function useFormValidation() {
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  /** Mark a field as touched and validate it */
  const touchField = useCallback((name, value, rules) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => {
      const err = validateField(value, rules);
      if (err) return { ...prev, [name]: err };
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  /** Validate all fields at once (returns true if valid) */
  const validate = useCallback((form, rulesMap) => {
    const newErrors = {};
    const newTouched = {};
    for (const [name, rules] of Object.entries(rulesMap)) {
      newTouched[name] = true;
      const err = validateField(form[name], rules);
      if (err) newErrors[name] = err;
    }
    setTouched((prev) => ({ ...prev, ...newTouched }));
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  /** Reset all touched + errors */
  const resetValidation = useCallback(() => {
    setTouched({});
    setErrors({});
  }, []);

  /** Helper: returns className for a form-group */
  const groupClass = useCallback((name) => {
    return `form-group${touched[name] && errors[name] ? ' form-group--error' : ''}`;
  }, [touched, errors]);

  return { touched, errors, touchField, validate, resetValidation, groupClass };
}
