export default function Topbar({ title, children }) {
  return (
    <header className="topbar">
      <h1 className="topbar__title">{title}</h1>
      <div className="topbar__actions">{children}</div>
    </header>
  );
}
