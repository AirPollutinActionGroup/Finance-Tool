import { NavLink } from "react-router-dom";
import { useState } from "react";
import DonorCard from "../components/DonorCard";
import HorizontalCarousel from "../components/HorizontalCarousel";
import Modal from "../components/Modal";
import { donors, programs } from "../data/mockData";
import { formatCurrency, formatPercent } from "../utils/format";

const DonorsPage = () => {
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);
  const selectedDonor = donors.find((donor) => donor.id === selectedDonorId);
  const donorPreferences = selectedDonor
    ? selectedDonor.preferences.map((preference) => {
        const programName =
          programs.find((program) => program.id === preference.programId)?.name ??
          "Program";
        return {
          programName,
          weight: preference.weight,
        };
      })
    : [];

  return (
    <section className="page-section">
      <header className="page-header">
        <div>
          <h1>Donors</h1>
          <p>Partners funding priority programs.</p>
        </div>
        <div className="page-meta">
          <span>{donors.length} donors</span>
        </div>
      </header>
      <HorizontalCarousel ariaLabel="Donor cards">
        {donors.map((donor) => (
          <div key={donor.id} className="card-link" role="presentation">
            <DonorCard
              donor={donor}
              onDetails={() => setSelectedDonorId(donor.id)}
            />
          </div>
        ))}
      </HorizontalCarousel>
      <section className="detail-card">
        <h2>Donor Directory</h2>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Donor</th>
                <th>Type</th>
                <th>Admin %</th>
                <th>FCRA</th>
                <th>Contribution</th>
                <th>Preferences</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {donors.map((donor) => (
                <tr key={donor.id}>
                  <td>{donor.name}</td>
                  <td>{donor.type}</td>
                  <td>{formatPercent(donor.adminOverheadPercent)}</td>
                  <td>{donor.fcraApproved ? "Yes" : "No"}</td>
                  <td>{formatCurrency(donor.contributionAmount)}</td>
                  <td>{donor.preferences.length}</td>
                  <td>
                    <button
                      type="button"
                      className="table-action"
                      onClick={() => setSelectedDonorId(donor.id)}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <Modal
        isOpen={Boolean(selectedDonor)}
        title="Donor details"
        onClose={() => setSelectedDonorId(null)}
      >
        {selectedDonor ? (
          <div className="modal-grid">
            <div className="modal-hero">
              <div>
                <p className="detail-eyebrow">Donor</p>
                <h3>{selectedDonor.name}</h3>
                <p className="detail-subtitle">{selectedDonor.type}</p>
              </div>
            </div>
            <div className="detail-grid">
              <section className="detail-card">
                <h2>Overview</h2>
                <div className="table-wrapper">
                  <table className="data-table">
                    <tbody>
                      <tr>
                        <th>Contribution</th>
                        <td>{formatCurrency(selectedDonor.contributionAmount)}</td>
                      </tr>
                      <tr>
                        <th>Admin overhead</th>
                        <td>{formatPercent(selectedDonor.adminOverheadPercent)}</td>
                      </tr>
                      <tr>
                        <th>FCRA</th>
                        <td>{selectedDonor.fcraApproved ? "Approved" : "No"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
              <section className="detail-card">
                <h2>Preferences</h2>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Program</th>
                        <th>Weight</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donorPreferences.map((preference) => (
                        <tr key={preference.programName}>
                          <td>{preference.programName}</td>
                          <td>{formatPercent(preference.weight)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
            <div className="modal-actions">
              <NavLink
                to={`/donors/${selectedDonor.id}`}
                className="modal-link"
              >
                Open full profile
              </NavLink>
              <button
                type="button"
                className="ghost-button"
                onClick={() => setSelectedDonorId(null)}
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

export default DonorsPage;
