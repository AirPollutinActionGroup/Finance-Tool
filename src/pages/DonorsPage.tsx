import { NavLink } from "react-router-dom";
import DonorCard from "../components/DonorCard";
import HorizontalCarousel from "../components/HorizontalCarousel";
import { donors } from "../data/mockData";

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
          <NavLink key={donor.id} to={`/donors/${donor.id}`} className="card-link">
            <DonorCard donor={donor} />
          </NavLink>
        ))}
      </HorizontalCarousel>
    </section>
  );
};

export default DonorsPage;
