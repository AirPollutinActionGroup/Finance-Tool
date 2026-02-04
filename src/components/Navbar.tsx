import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <span className="navbar-brand">FundFlow</span>
        <nav aria-label="Primary">
          <ul className="navbar-links">
            <li>
              <NavLink to="/dashboard">Dashboard</NavLink>
            </li>
            <li>
              <NavLink to="/employees">Employees</NavLink>
            </li>
            <li>
              <NavLink to="/donors">Donors</NavLink>
            </li>
            <li>
              <NavLink to="/programs">Programs & Geo</NavLink>
            </li>
            <li>
              <NavLink to="/simulation">Simulation</NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
