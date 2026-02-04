import { NavLink } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <section className="page-section" style={{ 
      minHeight: "60vh", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center",
      textAlign: "center",
      gap: "var(--space-lg)"
    }}>
      <div style={{ 
        fontSize: "6rem", 
        fontWeight: "700", 
        color: "var(--ink-muted)",
        lineHeight: "1",
        letterSpacing: "-0.04em"
      }}>
        404
      </div>
      <div>
        <h1 style={{ marginBottom: "var(--space-sm)" }}>Page Not Found</h1>
        <p style={{ color: "var(--ink-muted)", margin: 0 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <NavLink to="/dashboard" className="modal-link">
        Return to Dashboard
      </NavLink>
    </section>
  );
};

export default NotFoundPage;
