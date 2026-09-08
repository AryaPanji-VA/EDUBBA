export function ProgressBar({ value }: { value: number }) {
  return <div className="bar" aria-label={`${value}% complete`}><span style={{ width: `${value}%` }} /></div>;
}
