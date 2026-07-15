// src/lib/constants.ts

export const MANDI_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

export const MANDI_COMMODITIES = [
  "Tomato",
  "Onion",
  "Potato",
  "Wheat",
  "Rice",
  "Paddy(Dhan)(Common)",
  "Maize",
  "Soyabean",
  "Cotton",
  "Gram Raw(Chholia)",
  "Bajra(Pearl Millet/Cumbu)",
  "Groundnut",
  "Mustard",
  "Sugarcane",
  "Turmeric",
  "Green Chilli",
  "Dry Chillies",
  "Banana",
  "Mango",
  "Brinjal",
  "Cabbage",
  "Cauliflower",
  "Ginger(Green)",
  "Garlic",
  "Coriander(Leaves)",
  "Cucumber",
  "Lady Finger",
  "Green Peas",
  "Carrot",
  "Papaya",
  "Apple",
  "Grapes",
  "Arhar (Tur/Red Gram)(Whole)",
  "Moong(Green Gram)(Whole)",
  "Urad",
  "Sesamum(Sesame,Gingelly,Til)",
  "Coconut",
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
