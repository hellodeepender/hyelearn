import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm overflow-x-auto pb-1 mb-4 scrollbar-hide">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5 shrink-0">
          {i > 0 && <span className="text-brown-300">&rsaquo;</span>}
          {item.href ? (
            <Link href={item.href} className="text-brown-400 hover:text-brown-600 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-brown-700 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
