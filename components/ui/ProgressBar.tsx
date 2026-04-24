export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="progress-shell" aria-label="Progress">
      <div className="progress-bar" style={{ width: `${value}%` }} />
    </div>
  );
}
