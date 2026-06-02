export { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.validation';
export type { LoginFormData, RegisterFormData, ForgotPasswordFormData, ResetPasswordFormData } from './auth.validation';

export { bookAppointmentSchema, rescheduleSchema } from './appointment.validation';
export type { BookAppointmentFormData, RescheduleFormData } from './appointment.validation';

export { patientProfileSchema, doctorProfileSchema } from './profile.validation';
export type { PatientProfileFormData, DoctorProfileFormData } from './profile.validation';
