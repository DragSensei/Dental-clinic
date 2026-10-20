export default function Loading() {
  return <main aria-busy="true" aria-label="Loading page" className="page-shell flex-1"><div className="surface animate-pulse motion-reduce:animate-none p-8"><div className="h-4 w-28 rounded bg-muted" /><div className="mt-5 h-9 max-w-md rounded bg-muted" /><div className="mt-4 h-4 max-w-xl rounded bg-muted" /></div></main>;
}
