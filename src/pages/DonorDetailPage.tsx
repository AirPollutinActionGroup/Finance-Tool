import { NavLink, useParams } from "react-router-dom";
import { donors, programs } from "../data/mockData";

const DonorDetailPage = () => {
  const { donorId } = useParams();

  const donor = donors.find((item) => item.id === donorId);

  if (!donor) {
    return (
      <section className="page-section">
        <h1>Donor not found</h1>
        <p>
          Return to the <NavLink to="/donors">donors list</NavLink>.
        </p>
      </section>
    );
  }

  const preferenceSummaries = donor.preferences.map((preference) => {
    const programName =
      programs.find((program) => program.id === preference.programId)?.name ??
      "Unknown program";

    return {
      programName,
      weight: preference.weight,
    };
  });

  return (
    <section className="page-section">
      <header className="detail-header">
        <div className="detail-header-body">
          <p className="detail-eyebrow">Donor</p>
          <h1>{donor.name}</h1>
          <p className="detail-subtitle">{donor.type}</p>
        </div>
      </header>
      <div className="detail-grid">
        <section className="detail-card">
          <h2>Overview</h2>
          <div className="detail-row">
            <span>Donor type</span>
            <span>{donor.type}</span>
          </div>
          <div className="detail-row">
            <span>Contribution</span>
            <span>INR {donor.contributionAmount.toLocaleString("en-IN")}</span>
          </div>
          <div className="detail-row">
            <span>Preferences</span>
            <span>{donor.preferences.length} allocations</span>
          </div>
        </section>
        <section className="detail-card">
          <h2>Allocation Preferences</h2>
          <ul className="detail-list">
            {preferenceSummaries.map((preference) => (
              <li key={preference.programName} className="detail-list-item">
                <span>{preference.programName}</span>
                <span>{preference.weight}%</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
};

export default DonorDetailPage;
