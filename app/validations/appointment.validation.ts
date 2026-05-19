import * as Yup from 'yup';

export const bookAppointmentSchema = Yup.object({
  doctor: Yup.number()
    .required('Please select a doctor'),

  date: Yup.string()
    .required('Date is required')
    .test('future-date', 'Date must be today or in the future', (value) => {
      if (!value) return false;
      const selectedDate = new Date(value);
      selectedDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }),

  time_slot: Yup.number()
    .required('Please select a time slot'),

  notes: Yup.string()
    .max(500, 'Notes must be less than 500 characters')
    .optional(),
});

export const rescheduleSchema = Yup.object({
  date: Yup.string()
    .required('Date is required')
    .test('future-date', 'Date must be today or in the future', (value) => {
      if (!value) return false;
      const selectedDate = new Date(value);
      selectedDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }),

  time_slot: Yup.number()
    .required('Please select a time slot'),
});

export type BookAppointmentFormData = Yup.InferType<typeof bookAppointmentSchema>;
export type RescheduleFormData = Yup.InferType<typeof rescheduleSchema>;