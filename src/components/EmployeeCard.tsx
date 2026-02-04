import type { Employee } from "../types";

type EmployeeCardProps = {
  employee: Employee;
};

const EmployeeCard = ({ employee }: EmployeeCardProps) => {
  return (
    <article className="employee-card">
      <div className="employee-card-media">
        <img src={employee.photoUrl} alt={employee.name} />
      </div>
      <div className="employee-card-body">
        <div>
          <h2>{employee.name}</h2>
          <p>{employee.role}</p>
        </div>
        <div className="employee-card-meta">
          <span>{employee.geography}</span>
          <span>
            INR {employee.monthlyCost.toLocaleString("en-IN")}/mo
          </span>
        </div>
      </div>
    </article>
  );
};

export default EmployeeCard;
