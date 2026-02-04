import type { Donor } from "../types";

type DonorCardProps = {
  donor: Donor;
};

const DonorCard = ({ donor }: DonorCardProps) => {
  return (
    <article className="donor-card">
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
    </article>
  );
};

export default DonorCard;
