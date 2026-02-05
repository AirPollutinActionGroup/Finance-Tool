import type { Donor } from "../types";
import { formatCurrency, formatPercent } from "../utils/format";

type DonorCardProps = {
  donor: Donor;
  onDetails?: () => void;
};

const DonorCard = ({ donor, onDetails }: DonorCardProps) => {
  return (
    <article className="donor-card">
      <div className="donor-card-body">
        <div>
          <h2>{donor.name}</h2>
          <p>{donor.type}</p>
        </div>
        <div className="donor-card-meta">
          <span>Admin: {formatPercent(donor.adminOverheadPercent)}</span>
          <span>{donor.fcraApproved ? "FCRA: Yes" : "FCRA: No"}</span>
        </div>
        <div className="donor-card-value">
          {formatCurrency(donor.contributionAmount)}
        </div>
      </div>
    </article>
  );
};

export default DonorCard;
