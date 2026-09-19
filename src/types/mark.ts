export type PaidMark = {
  id: number;
  created_at: string;
  country: string;
  message: string | null;
  image_url: string;
  mark_number: number;
  longitude: number | null;
  latitude: number | null;
};