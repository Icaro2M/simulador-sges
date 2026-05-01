import { NavLink } from "react-router-dom";

const navigationItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Simulação", to: "/simulation" },
  { label: "Comparação", to: "/comparison" },
  { label: "Sensibilidade", to: "/sensitivity" },
  { label: "Monte Carlo", to: "/monte-carlo" },
  { label: "Dispatch", to: "/dispatch" },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <strong>SGES</strong>
        <span>Simulator</span>
      </div>

      <nav className="sidebar-nav">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? "sidebar-link sidebar-link-active" : "sidebar-link"
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}