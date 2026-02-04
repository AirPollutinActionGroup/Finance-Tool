import { programs } from "../data/mockData";

const ProgramsPage = () => {
  return (
    <section className="page-section">
      <header className="page-header">
        <div>
          <h1>Programs</h1>
          <p>Core initiatives funded by partners.</p>
        </div>
        <div className="page-meta">
          <span>{programs.length} programs</span>
        </div>
      </header>
      <div className="list-layout">
        <ul className="program-list">
          {programs.map((program) => (
            <li key={program.id} className="program-list-item">
              <div className="program-list-primary">
                <h2>{program.name}</h2>
                <p>{program.description}</p>
              </div>
              <div className="program-list-secondary">
                <span>{program.geography}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ProgramsPage;
