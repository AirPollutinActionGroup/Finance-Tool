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
      <div className="list-layout">
        <ul className="employee-list">
          {employees.map((employee) => (
            <li key={employee.id} className="employee-list-item">
              <div className="employee-list-primary">
                <h2>{employee.name}</h2>
                <p>{employee.role}</p>
              </div>
              <div className="employee-list-secondary">
                <span>{employee.geography}</span>
                <span>
                  INR {employee.monthlyCost.toLocaleString("en-IN")}/mo
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default EmployeesPage;
