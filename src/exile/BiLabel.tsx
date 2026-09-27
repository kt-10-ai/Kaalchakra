/**
 * Renders a "देवनागरी · English" label. Devanagari must not receive
 * letter-spacing or `uppercase` — tracking breaks its conjuncts visually,
 * so only the Latin half gets the small-caps treatment.
 */
export default function BiLabel({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const sep = text.indexOf(" · ");
  if (sep === -1) {
    return <span className={`tracking-widest uppercase ${className}`}>{text}</span>;
  }
  const deva = text.slice(0, sep);
  const latin = text.slice(sep + 3);
  return (
    <span className={className}>
      <span className="font-normal">{deva}</span>
      <span className="tracking-widest uppercase"> · {latin}</span>
    </span>
  );
}
