import * as Yup from 'yup';

export const loginSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),

  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

export const registerSchema = Yup.object({
  first_name: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required'),

  last_name: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required'),

  email: Yup.string().email('Invalid email address').required('Email is required'),

  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .required('Password is required'),

  confirm_password: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),

  role: Yup.string().oneOf(['patient', 'doctor'], 'Invalid role').required('Role is required'),

  specialty: Yup.string().when('role', {
    is: 'doctor',
    then: (schema) => schema.required('Please select your specialty'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export const forgotPasswordSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
});

export const resetPasswordSchema = Yup.object({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .required('Password is required'),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
});

export type LoginFormData = Yup.InferType<typeof loginSchema>;
export type RegisterFormData = Yup.InferType<typeof registerSchema>;
export type ForgotPasswordFormData = Yup.InferType<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = Yup.InferType<typeof resetPasswordSchema>;
