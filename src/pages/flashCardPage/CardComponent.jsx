export default function CardComponent({ text, className = '', textClassName = '', onClick }) {
  return (
    <div
      className={`soft-bg-animate bg-white rounded-2xl border border-slate-200 text-center ${className}`}
      onClick={onClick}
    >
      <span className={textClassName}>{text}</span>
    </div>
  );
}