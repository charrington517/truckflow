export type LeadPayload = {
  name?: string;
  email: string;
  businessName?: string;
  city: string;
  foodType: string;
};

export type LeadResponse = {
  success: boolean;
  message: string;
};

export type WaitlistLead = LeadPayload & {
  createdAt: string;
};
