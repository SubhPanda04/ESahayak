import { z } from 'zod';
import {
  cityEnum,
  propertyTypeEnum,
  bhkEnum,
  purposeEnum,
  timelineEnum,
  sourceEnum,
  statusEnum,
} from './db/schema';

const phoneRegex = /^\d{10,15}$/;

export const buyerFormSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().regex(phoneRegex, 'Phone must be 10-15 digits'),
    city: z.enum(cityEnum),
    propertyType: z.enum(propertyTypeEnum),
    bhk: z.enum(bhkEnum).optional(),
    purpose: z.enum(purposeEnum),
    budgetMin: z.number().int().positive().optional(),
    budgetMax: z.number().int().positive().optional(),
    timeline: z.enum(timelineEnum),
    source: z.enum(sourceEnum),
    notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
    tags: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.propertyType === 'Apartment' || data.propertyType === 'Villa') {
        return data.bhk !== undefined;
      }
      return true;
    },
    {
      message: 'BHK is required for Apartment and Villa',
      path: ['bhk'],
    }
  )
  .refine(
    (data) => {
      if (data.budgetMin && data.budgetMax) {
        return data.budgetMax >= data.budgetMin;
      }
      return true;
    },
    {
      message: 'Budget max must be greater than or equal to budget min',
      path: ['budgetMax'],
    }
  );

export type BuyerFormData = z.infer<typeof buyerFormSchema>;