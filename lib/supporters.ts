// Shared types for supporters/donations
export interface Supporter {
  name: string;
  date: string;
  message: string | null;
}

export function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}
