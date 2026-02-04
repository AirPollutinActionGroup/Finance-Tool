import { NavLink, useParams } from "react-router-dom";
import { employees } from "../data/mockData";

const EmployeeDetailPage = () => {
  const { employeeId } = useParams();

  const employee = employees.find((item) => item.id === employeeId);

  if (!employee) {
    return (
      <section className="page-section">
        <h1>Employee not found</h1>
        <p>
          Return to the <NavLink to="/employees">employees list</NavLink>.
        </p>
      </section>
    );
  }

  return (
    <section className="page-section">
      <header className="detail-header">
        <div className="detail-header-media">
          <img src={employee.photoUrl} alt={employee.name} />
        </div>
        <div className="detail-header-body">
          <p className="detail-eyebrow">Employee</p>
          <h1>{employee.name}</h1>
          <p className="detail-subtitle">{employee.role}</p>
        </div>
      </header>
      <div className="detail-grid">
        <section className="detail-card">
          <h2>Profile</h2>
          <div className="detail-row">
            <span>Role</span>
            <span>{employee.role}</span>
          </div>
          <div className="detail-row">
            <span>Region</span>
            <span>{employee.geography}</span>
          </div>
          <div className="detail-row">
            <span>Monthly cost</span>
            <span>INR {employee.monthlyCost.toLocaleString("en-IN")}</span>
          </div>
        </section>
        <section className="detail-card">
          <h2>Assignments</h2>
          <p>Program assignments and workload details will appear here.</p>
        </section>
      </div>
    </section>
  );
};

export default EmployeeDetailPage;
