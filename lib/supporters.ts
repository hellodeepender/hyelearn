// Hardcoded supporters data — will be replaced with Supabase query later
export interface Supporter {
  name: string;
  date: string;
  message: string | null;
  anonymous: boolean;
}

export const SUPPORTERS: Supporter[] = [
  { name: "Victoria Vartkessian", date: "March 21, 2026", message: null, anonymous: false },
  { name: "Wartan Vartkessian", date: "March 20, 2026", message: null, anonymous: false },
  { name: "Nina Vartkessian", date: "March 19, 2026", message: null, anonymous: false },
  { name: "Ourania Kampagianni", date: "March 18, 2026", message: null, anonymous: false },
  { name: "D Singh", date: "March 17, 2026", message: null, anonymous: false },
];

export function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}
