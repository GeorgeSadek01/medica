import * as Yup from 'yup';

export const patientProfileSchema = Yup.object({
  first_name: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required'),

  last_name: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required'),

  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),

  phone: Yup.string()
    .matches(/^[0-9]{11}$/, 'Phone number must be 11 digits')
    .optional(),
});

export const doctorProfileSchema = Yup.object({
  first_name: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required'),

  last_name: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required'),

  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),

  specialty: Yup.mixed()
    .required('Specialty is required'),

  bio: Yup.string()
    .max(1000, 'Bio must be less than 1000 characters')
    .optional(),

  phone: Yup.string()
    .matches(/^[0-9]{11}$/, 'Phone number must be 11 digits')
    .optional(),
});

export type PatientProfileFormData = Yup.InferType<typeof patientProfileSchema>;
export type DoctorProfileFormData = Yup.InferType<typeof doctorProfileSchema>;