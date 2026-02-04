import { NavLink } from "react-router-dom";
import { useState } from "react";
import EmployeeCard from "../components/EmployeeCard";
import HorizontalCarousel from "../components/HorizontalCarousel";
import Modal from "../components/Modal";
import { employees, programs } from "../data/mockData";
import { formatCurrency, formatDate } from "../utils/format";

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
      <section className="detail-card">
        <h2>Employee Directory</h2>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Program</th>
                <th>Location</th>
                <th>Joining</th>
                <th>Monthly Salary</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => {
                const programName =
                  programs.find((program) => program.id === employee.programId)
                    ?.name ?? "Unassigned";

                return (
                  <tr key={employee.id}>
                    <td>{employee.name}</td>
                    <td>{employee.role}</td>
                    <td>{programName}</td>
                    <td>
                      {employee.city}, {employee.geography}
                    </td>
                    <td>{formatDate(employee.joiningDate)}</td>
                    <td>{formatCurrency(employee.monthlySalary)}</td>
                    <td>
                      <button
                        type="button"
                        className="table-action"
                        onClick={() => setSelectedEmployeeId(employee.id)}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
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
                <div className="table-wrapper">
                  <table className="data-table">
                    <tbody>
                      <tr>
                        <th>Location</th>
                        <td>
                          {selectedEmployee.city}, {selectedEmployee.geography}
                        </td>
                      </tr>
                      <tr>
                        <th>Program</th>
                        <td>{selectedProgram}</td>
                      </tr>
                      <tr>
                        <th>Joined</th>
                        <td>{formatDate(selectedEmployee.joiningDate)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
              <section className="detail-card">
                <h2>Compensation</h2>
                <div className="table-wrapper">
                  <table className="data-table">
                    <tbody>
                      <tr>
                        <th>Monthly salary</th>
                        <td>{formatCurrency(selectedEmployee.monthlySalary)}</td>
                      </tr>
                      <tr>
                        <th>PF contribution</th>
                        <td>{formatCurrency(selectedEmployee.pfContribution)}</td>
                      </tr>
                      <tr>
                        <th>TDS deduction</th>
                        <td>{formatCurrency(selectedEmployee.tdsDeduction)}</td>
                      </tr>
                    </tbody>
                  </table>
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
