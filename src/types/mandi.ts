export interface MandiRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrivalDate: string; // ISO format: yyyy-mm-dd
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
}