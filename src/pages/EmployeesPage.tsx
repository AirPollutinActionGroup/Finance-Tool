import { NavLink } from "react-router-dom";
import EmployeeCard from "../components/EmployeeCard";
import HorizontalCarousel from "../components/HorizontalCarousel";
import { employees } from "../data/mockData";

const EmployeesPage = () => {
  return (
    <section className="page-section">
      <header className="page-header">
        <div>
          <h1>Employees</h1>
          <p>Active team members across priority regions.</p>
        </div>
        <div className="page-meta">
          <span>{employees.length} employees</span>
        </div>
      </header>
      <HorizontalCarousel ariaLabel="Employee cards">
        {employees.map((employee) => (
          <NavLink
            key={employee.id}
            to={`/employees/${employee.id}`}
            className="card-link"
          >
            <EmployeeCard employee={employee} />
          </NavLink>
        ))}
      </HorizontalCarousel>
    </section>
  );
};

export default EmployeesPage;
