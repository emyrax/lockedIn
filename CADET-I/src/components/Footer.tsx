import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo-name">
              <span>COMMUNITY AMBASSADOR</span>
              <span>FOR DEVELOPMENTAL AND ENGAGEMENT</span>
              <span>TECHNIQUES INITIATIVE</span>
              <span className="Last_Child">(C.A.D.E.T.I.)</span>
            </div>
            <p className="footer-motto">"To build and secure the hope of youths in the society."</p>
            <div className="contact-details">
              <p><i className="fas fa-map-marker-alt"></i> University of Nigeria, Nsukka</p>
              <p><i className="fas fa-phone"></i> 08124917899</p>
              <p><i className="fas fa-envelope"></i> cadetienugu@gmail.com</p>
            </div>
          </div>

          <div className="footer-links">
            <h4>Quick Access</h4>
            <ul>
              <li><Link to="/"><i className="fa-solid fa-chevron-right"></i> Home Portal</Link></li>
              <li><Link to="/recruit-reg"><i className="fa-solid fa-chevron-right"></i> Recruit Registration</Link></li>
              <li><Link to="/member-validation"><i className="fa-solid fa-chevron-right"></i> Member Validation</Link></li>
              <li><Link to="/member-revalidation"><i className="fa-solid fa-chevron-right"></i> Member Revalidation</Link></li>
            </ul>
          </div>

          <div className="footer-social">
            <h4>Stay Connected</h4>
            <p className="social-text">Follow our mission across our official channels.</p>
            <div className="social-icons">
              <a href="https://www.facebook.com/share/17sJmwQRfN/" target="_blank" rel="noopener" title="Facebook"><i className="fab fa-facebook-f"></i></a>
              <a href="https://www.instagram.com/cadetinitiative/" target="_blank" rel="noopener" title="Instagram"><i className="fab fa-instagram"></i></a>
              <a href="https://x.com/cadetinitiative" target="_blank" rel="noopener" title="X"><i className="fab fa-x-twitter"></i></a>
              <a href="https://whatsapp.com/channel/0029VaBt7fA9sBI0CF5WLL37" target="_blank" rel="noopener" title="Channel"><i className="fab fa-whatsapp"></i></a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} CADETI | Developed by Oracle Tek GS. All rights reserved.</p>
        </div>
      </div>

      <a href="https://wa.me/2348124917899" className="whatsapp-float" target="_blank" rel="noopener">
        <i className="fab fa-whatsapp"></i>
        <span>Official Support</span>
      </a>
    </footer>
  );
}
