export type LeadInput = {
  name?: string;
  email: string;
  businessName?: string;
  city: string;
  foodType: string;
};

export type Lead = LeadInput & {
  id: string;
  createdAt: string;
};

export type LeadResult = {
  success: true;
  message: string;
  duplicate: boolean;
  lead?: Lead;
};
