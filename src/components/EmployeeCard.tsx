import type { Employee } from "../types";
import { formatCurrency } from "../utils/format";

type EmployeeCardProps = {
  employee: Employee;
  onDetails?: () => void;
  donorCount?: number;
};

const EmployeeCard = ({
  employee,
  onDetails,
  donorCount,
}: EmployeeCardProps) => {
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
          <span>
            {employee.city}, {employee.geography}
          </span>
          <span>
            {formatCurrency(employee.monthlySalary * 12)}/year
          </span>
          {typeof donorCount === "number" ? (
            <span>{donorCount} donors</span>
          ) : null}
        </div>
        {onDetails && (
          <div className="card-footer">
            <button
              type="button"
              className="card-detail-button"
              onClick={(e) => {
                e.stopPropagation();
                onDetails();
              }}
            >
              Details
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default EmployeeCard;
