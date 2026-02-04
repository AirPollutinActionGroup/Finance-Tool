import type { Employee } from "../types";
import { formatCurrency } from "../utils/format";

type EmployeeCardProps = {
  employee: Employee;
  onDetails?: () => void;
};

const EmployeeCard = ({ employee, onDetails }: EmployeeCardProps) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!onDetails) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onDetails();
    }
  };

  return (
    <article
      className="employee-card"
      role={onDetails ? "button" : undefined}
      tabIndex={onDetails ? 0 : undefined}
      onClick={onDetails}
      onKeyDown={handleKeyDown}
    >
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
            {formatCurrency(employee.monthlySalary)}/mo
          </span>
        </div>
      </div>
      <div className="card-footer">
        <button
          type="button"
          className="card-detail-button"
          onClick={(event) => {
            event.stopPropagation();
            onDetails?.();
          }}
        >
          Details
        </button>
      </div>
    </article>
  );
};

export default EmployeeCard;
