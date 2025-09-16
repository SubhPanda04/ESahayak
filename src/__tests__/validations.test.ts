import { buyerFormSchema } from '../lib/validations';

describe('buyerFormSchema', () => {
  it('should validate budget max >= budget min', () => {
    const validData = {
      fullName: 'John Doe',
      phone: '1234567890',
      city: 'Chandigarh',
      propertyType: 'Apartment',
      purpose: 'Buy',
      timeline: '0-3m',
      source: 'Website',
      budgetMin: 100000,
      budgetMax: 200000,
    };

    expect(buyerFormSchema.safeParse(validData).success).toBe(true);

    const invalidData = {
      ...validData,
      budgetMin: 200000,
      budgetMax: 100000,
    };

    expect(buyerFormSchema.safeParse(invalidData).success).toBe(false);
  });

  it('should require bhk for Apartment and Villa', () => {
    const dataWithoutBhk = {
      fullName: 'John Doe',
      phone: '1234567890',
      city: 'Chandigarh',
      propertyType: 'Apartment',
      purpose: 'Buy',
      timeline: '0-3m',
      source: 'Website',
    };

    expect(buyerFormSchema.safeParse(dataWithoutBhk).success).toBe(false);
  });
});