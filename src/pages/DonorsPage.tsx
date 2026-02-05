import { NavLink } from "react-router-dom";
import DonorCard from "../components/DonorCard";
import HorizontalCarousel from "../components/HorizontalCarousel";
import { donors, programs } from "../data/mockData";
import { formatCurrency, formatPercent } from "../utils/format";

const DonorsPage = () => {

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
          <NavLink 
            key={donor.id} 
            to={`/donors/${donor.id}`}
            className="card-link"
          >
            <DonorCard donor={donor} />
          </NavLink>
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
                    <NavLink
                      to={`/donors/${donor.id}`}
                      className="table-action"
                    >
                      Details
                    </NavLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
};

export default DonorsPage;
