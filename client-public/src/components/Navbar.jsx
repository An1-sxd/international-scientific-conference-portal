import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar" id="main-navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand" id="navbar-brand">
          <span className="navbar__logo-icon">🎓</span>
          <span className="navbar__logo-text">
            Blida<span className="text-gradient">1</span> Portal
          </span>
        </Link>

        <div className="navbar__links" id="navbar-links">
          <NavLink to="/" end className="navbar__link">Home</NavLink>
          <NavLink to="/conferences" className="navbar__link">Conferences</NavLink>
          <NavLink to="/speakers" className="navbar__link">Speakers</NavLink>
          <NavLink to="/submit-paper" className="navbar__link">Submit Paper</NavLink>
          <NavLink to="/track-submission" className="navbar__link">Track Submission</NavLink>
          <NavLink to="/track-registration" className="navbar__link">Track Registration</NavLink>
          <NavLink to="/verify-certificate" className="navbar__link">Certificate</NavLink>
        </div>
      </div>
    </nav>
  );
}
