// Re-mounts on every navigation, so the CSS entrance plays on each page.
// Pure CSS (no JS needed), so content is never hidden waiting for hydration.
export default function Template({ children }) {
  return <div className="animate-page-in">{children}</div>;
}
