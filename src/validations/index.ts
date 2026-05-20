export { loginSchema, registerSchema } from './auth.validation';
export type { LoginFormData, RegisterFormData } from './auth.validation';

export { bookAppointmentSchema, rescheduleSchema } from './appointment.validation';
export type { BookAppointmentFormData, RescheduleFormData } from './appointment.validation';

export { patientProfileSchema, doctorProfileSchema } from './profile.validation';
export type { PatientProfileFormData, DoctorProfileFormData } from './profile.validation';
