import { NavLink } from "react-router-dom";
import { useState } from "react";
import EmployeeCard from "../components/EmployeeCard";
import HorizontalCarousel from "../components/HorizontalCarousel";
import Modal from "../components/Modal";
import { employees, programs } from "../data/mockData";

const EmployeesPage = () => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );
  const selectedEmployee = employees.find(
    (employee) => employee.id === selectedEmployeeId
  );
  const selectedProgram =
    programs.find((program) => program.id === selectedEmployee?.programId)?.name ??
    "Unassigned";

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
          <div
            key={employee.id}
            className="card-link"
            role="presentation"
          >
            <EmployeeCard
              employee={employee}
              onDetails={() => setSelectedEmployeeId(employee.id)}
            />
          </div>
        ))}
      </HorizontalCarousel>
      <Modal
        isOpen={Boolean(selectedEmployee)}
        title="Employee details"
        onClose={() => setSelectedEmployeeId(null)}
      >
        {selectedEmployee ? (
          <div className="modal-grid">
            <div className="modal-hero">
              <img src={selectedEmployee.photoUrl} alt={selectedEmployee.name} />
              <div>
                <p className="detail-eyebrow">Employee</p>
                <h3>{selectedEmployee.name}</h3>
                <p className="detail-subtitle">{selectedEmployee.role}</p>
              </div>
            </div>
            <div className="detail-grid">
              <section className="detail-card">
                <h2>Profile</h2>
                <div className="detail-row">
                  <span>Location</span>
                  <span>
                    {selectedEmployee.city}, {selectedEmployee.geography}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Program</span>
                  <span>{selectedProgram}</span>
                </div>
                <div className="detail-row">
                  <span>Joined</span>
                  <span>{selectedEmployee.joiningDate}</span>
                </div>
              </section>
              <section className="detail-card">
                <h2>Compensation</h2>
                <div className="detail-row">
                  <span>Monthly salary</span>
                  <span>
                    INR {selectedEmployee.monthlySalary.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="detail-row">
                  <span>PF contribution</span>
                  <span>
                    INR {selectedEmployee.pfContribution.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="detail-row">
                  <span>TDS deduction</span>
                  <span>
                    INR {selectedEmployee.tdsDeduction.toLocaleString("en-IN")}
                  </span>
                </div>
              </section>
            </div>
            <div className="modal-actions">
              <NavLink
                to={`/employees/${selectedEmployee.id}`}
                className="modal-link"
              >
                Open full profile
              </NavLink>
              <button
                type="button"
                className="ghost-button"
                onClick={() => setSelectedEmployeeId(null)}
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
};

export default EmployeesPage;
