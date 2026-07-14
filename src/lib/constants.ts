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

const START_YEAR = 2015;
const CURRENT_YEAR = new Date().getFullYear();

export const MIN_YEAR = START_YEAR;
export const MAX_YEAR = CURRENT_YEAR;

// This automatically creates an array from 2015 to the present year
export const YEARS = Array.from(
  { length: CURRENT_YEAR - START_YEAR + 1 },
  (_, i) => START_YEAR + i
);
