import { format } from "date-fns";

export function formatDateForApi(date: Date) {
  return format(date, "yyyy-MM-dd");
}
