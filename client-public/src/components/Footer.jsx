import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer" id="site-footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <span className="footer__logo">🎓</span>
            <div>
              <h3 className="footer__title">Blida1 Portal</h3>
              <p className="footer__tagline">
                International Scientific Conference Platform — Université Blida 1
              </p>
            </div>
          </div>

          <div className="footer__links-grid">
            <div className="footer__col">
              <h4 className="footer__col-title">Navigate</h4>
              <Link to="/" className="footer__link">Home</Link>
              <Link to="/conferences" className="footer__link">Conferences</Link>
              <Link to="/speakers" className="footer__link">Speakers</Link>
            </div>
            <div className="footer__col">
              <h4 className="footer__col-title">Resources</h4>
              <Link to="/submit-paper" className="footer__link">Submit Paper</Link>
              <Link to="/track-submission" className="footer__link">Track Submission</Link>
              <Link to="/verify-certificate" className="footer__link">Verify Certificate</Link>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p>&copy; {new Date().getFullYear()} Blida1 Portal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
