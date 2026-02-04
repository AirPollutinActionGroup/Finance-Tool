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
