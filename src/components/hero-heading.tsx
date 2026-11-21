export function HeroHeading({ heading }: { heading: string }) {
  const name = "Emmanuel Olivo";
  const start = heading.indexOf(name);
  if (start === -1) return heading;

  return (
    <>
      {heading.slice(0, start)}
      <span className="inline-block bg-linear-to-br from-primary to-accent bg-clip-text text-transparent">{name}</span>
      {heading.slice(start + name.length)}
    </>
  );
}
