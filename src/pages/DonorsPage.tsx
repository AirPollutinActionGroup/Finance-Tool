import { NavLink } from "react-router-dom";
import { useState } from "react";
import DonorCard from "../components/DonorCard";
import HorizontalCarousel from "../components/HorizontalCarousel";
import Modal from "../components/Modal";
import { donors, programs } from "../data/mockData";

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
                <div className="detail-row">
                  <span>Contribution</span>
                  <span>
                    INR {selectedDonor.contributionAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Admin overhead</span>
                  <span>{selectedDonor.adminOverheadPercent}%</span>
                </div>
                <div className="detail-row">
                  <span>FCRA</span>
                  <span>{selectedDonor.fcraApproved ? "Approved" : "No"}</span>
                </div>
              </section>
              <section className="detail-card">
                <h2>Preferences</h2>
                <ul className="detail-list">
                  {donorPreferences.map((preference) => (
                    <li
                      key={preference.programName}
                      className="detail-list-item"
                    >
                      <span>{preference.programName}</span>
                      <span>{preference.weight}%</span>
                    </li>
                  ))}
                </ul>
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
