import type { Donor } from "../types";

type DonorCardProps = {
  donor: Donor;
  onDetails?: () => void;
};

const DonorCard = ({ donor, onDetails }: DonorCardProps) => {
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
      className="donor-card"
      role={onDetails ? "button" : undefined}
      tabIndex={onDetails ? 0 : undefined}
      onClick={onDetails}
      onKeyDown={handleKeyDown}
    >
      <div className="donor-card-body">
        <div>
          <h2>{donor.name}</h2>
          <p>{donor.type}</p>
        </div>
        <div className="donor-card-meta">
          <span>Admin: {donor.adminOverheadPercent}%</span>
          <span>{donor.fcraApproved ? "FCRA: Yes" : "FCRA: No"}</span>
        </div>
        <div className="donor-card-value">
          INR {donor.contributionAmount.toLocaleString("en-IN")}
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

export default DonorCard;
