export default function CardComponent({
  text,
  label,
  masked = false,
  className = '',
  textClassName = '',
  onClick
}) {
  const normalizedText = typeof text === 'string' ? text.trim() : text;
  const isEmpty = normalizedText === null
    || normalizedText === undefined
    || normalizedText === ''
    || normalizedText === '-'
    || normalizedText === '—';

  if (isEmpty) return null;

  return (
    <div
      className={`soft-bg-animate bg-white rounded-2xl border border-slate-200 text-center ${className}`}
      onClick={onClick}
    >
      <span className={textClassName}>
        {label && `${label}: `}
        {masked ? '****' : text}
      </span>
    </div>
  );
}