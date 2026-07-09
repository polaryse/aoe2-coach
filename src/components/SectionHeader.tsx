interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return (
    <div className="mb-7 border-b border-gold/25 pb-5">
      <p className="text-xs font-bold uppercase tracking-[0.32em] text-gold">{eyebrow}</p>
      <h1 className="mt-2 font-display text-4xl text-parchment drop-shadow md:text-5xl">{title}</h1>
      <p className="mt-3 max-w-3xl text-vellum">{description}</p>
    </div>
  );
}

