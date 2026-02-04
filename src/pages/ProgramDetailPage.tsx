import { NavLink, useParams } from "react-router-dom";
import { donors, programs } from "../data/mockData";

const ProgramDetailPage = () => {
  const { programId } = useParams();

  const program = programs.find((item) => item.id === programId);

  if (!program) {
    return (
      <section className="page-section">
        <h1>Program not found</h1>
        <p>
          Return to the <NavLink to="/programs">programs list</NavLink>.
        </p>
      </section>
    );
  }

  const donorCommitments = donors.filter((donor) =>
    donor.preferences.some((preference) => preference.programId === program.id)
  );
  const preferenceWeights = donorCommitments.map(
    (donor) =>
      donor.preferences.find((preference) => preference.programId === program.id)
        ?.weight ?? 0
  );
  const totalPledged = donorCommitments.reduce(
    (sum, donor) => sum + donor.contributionAmount,
    0
  );
  const averageWeight = preferenceWeights.length
    ? preferenceWeights.reduce((sum, weight) => sum + weight, 0) /
      preferenceWeights.length
    : 0;
  const highestWeight = preferenceWeights.length
    ? Math.max(...preferenceWeights)
    : 0;

  return (
    <section className="page-section">
      <header className="detail-header">
        <div className="detail-header-body">
          <p className="detail-eyebrow">Program</p>
          <h1>{program.name}</h1>
          <p className="detail-subtitle">{program.description}</p>
        </div>
      </header>
      <div className="detail-grid">
        <section className="detail-card">
          <h2>Overview</h2>
          <div className="detail-row">
            <span>Region</span>
            <span>{program.geography}</span>
          </div>
          <div className="detail-row">
            <span>Active donors</span>
            <span>{donorCommitments.length}</span>
          </div>
        </section>
        <section className="detail-card">
          <h2>Metrics</h2>
          <div className="detail-row">
            <span>Total pledged</span>
            <span>INR {totalPledged.toLocaleString("en-IN")}</span>
          </div>
          <div className="detail-row">
            <span>Average preference</span>
            <span>{averageWeight.toFixed(1)}%</span>
          </div>
          <div className="detail-row">
            <span>Highest preference</span>
            <span>{highestWeight}%</span>
          </div>
        </section>
        <section className="detail-card">
          <h2>Donor Alignment</h2>
          <ul className="detail-list">
            {donorCommitments.map((donor) => (
              <li key={donor.id} className="detail-list-item">
                <span>{donor.name}</span>
                <span>{donor.type}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
};

export default ProgramDetailPage;
