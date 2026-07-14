export const COMMODITIES = [
  "Tomato",
  "Onion",
  "Potato",
  "Wheat",
  "Paddy (Rice)",
  "Maize",
  "Soybean",
  "Cotton",
] as const;

export const STATES = [
  "Karnataka",
  "Maharashtra",
  "Punjab",
  "Uttar Pradesh",
  "Madhya Pradesh",
] as const;

export const MARKETS_BY_STATE: Record<string, string[]> = {
  Karnataka: ["Bengaluru (Yeshwanthpur)", "Mysuru", "Hubballi"],
  Maharashtra: ["Pune (Market Yard)", "Nashik", "Nagpur"],
  Punjab: ["Ludhiana", "Amritsar", "Patiala"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Ujjain"],
};

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export const YEARS = [2023, 2024, 2025, 2026] as const;
