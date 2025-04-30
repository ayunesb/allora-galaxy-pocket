import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Vault", path: "/vault" },
  { label: "KPI", path: "/insights/kpis" },
  { label: "Plugins", path: "/plugins/center" },
  { label: "Admin", path: "/admin" },
];

export default function SidebarNav() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 hidden sm:block">
      <div className="text-2xl font-bold text-green-700 mb-6">Allora OS</div>
      <ul className="space-y-2">
        {navItems.map((item, i) => (
          <li key={i}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `block px-3 py-2 rounded transition ${
                  isActive ? "bg-green-100 text-green-800 font-semibold" : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
