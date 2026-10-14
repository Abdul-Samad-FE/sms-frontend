/** Shared antd Form rules for organization / owner / admin forms. */

export const nameRules = (what = 'a name') => [
  { required: true, whitespace: true, message: `Please enter ${what}` },
  { max: 150, message: 'At most 150 characters' },
];

export const emailRules = [
  { required: true, message: 'Please enter an email' },
  { type: 'email', message: 'Enter a valid email' },
];

export const passwordRules = [
  { required: true, message: 'Please set a password' },
  { min: 8, message: 'At least 8 characters' },
];

/** Confirm-password rule matching the field `passwordField`. */
export const confirmRules = (passwordField) => [
  { required: true, message: 'Please confirm the password' },
  ({ getFieldValue }) => ({
    validator(_, value) {
      if (!value || getFieldValue(passwordField) === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('Passwords do not match'));
    },
  }),
];

/** Readable API error (FastAPI detail string or 422 list). */
export const apiError = (err) => {
  const detail = err?.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => d?.msg ?? String(d)).join('; ');
  }
  return detail || err?.message;
};
