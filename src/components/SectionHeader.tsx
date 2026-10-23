interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return (
    <div className="command-header mb-6">
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-gold">{eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-parchment md:text-4xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-vellum">{description}</p>
      </div>
    </div>
  );
}

