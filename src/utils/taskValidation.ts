import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1, 'Description is required'),
  dueDate: z.date(),
  address: z.string().trim().min(1, 'Address is required'),
});

export type TaskFormValues = z.infer<typeof taskSchema>;