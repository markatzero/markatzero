export type PaidMark = {
  id: number;
  created_at: string;
  country: string;
  country_code: string | null;
  message: string | null;
  image_url: string;
  mark_number: number;
  mark_type: "my" | "our";
  longitude: number | null;
  latitude: number | null;
};