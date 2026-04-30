import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "./theme";
import "./Navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { logoSrc } = useTheme();

  const closeMenu = () => setOpen(false);

  return (
    <nav className="navbar" id="main-navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand" id="navbar-brand" onClick={closeMenu}>
          <img className="navbar__logo-img" src={logoSrc} alt="" aria-hidden="true" />
          <span className="navbar__logo-text">
            Blida<span className="text-gradient">1</span> Portal
          </span>
        </Link>

        <button
          className="navbar__toggle"
          id="navbar-toggle"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
        </button>

        <div className={`navbar__links ${open ? "navbar__links--open" : ""}`} id="navbar-links">
          <NavLink to="/" end className="navbar__link" onClick={closeMenu}>Home</NavLink>
          <NavLink to="/conferences" className="navbar__link" onClick={closeMenu}>Conferences</NavLink>
          <NavLink to="/speakers" className="navbar__link" onClick={closeMenu}>Speakers</NavLink>
          <NavLink to="/submit-paper" className="navbar__link" onClick={closeMenu}>Submit Paper</NavLink>
          <NavLink to="/track-submission" className="navbar__link" onClick={closeMenu}>Track Submission</NavLink>
          <NavLink to="/track-registration" className="navbar__link" onClick={closeMenu}>Track Registration</NavLink>
          <NavLink to="/verify-certificate" className="navbar__link" onClick={closeMenu}>Certificate</NavLink>
          <ThemeToggle className="navbar__theme-toggle" />
        </div>
      </div>
    </nav>
  );
}
