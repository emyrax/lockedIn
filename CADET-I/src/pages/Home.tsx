import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../config/firebase";

const slides = ["/hbg1.jpg", "/hbg2.jpg", "/hbg3.jpg", "/hbg4.jpg", "/hbg5.jpg", "/hbg6.jpg"];

export default function Home() {
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [current, setCurrent] = useState(0);
  const [news, setNews] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    slideRefs.current.forEach((el, i) => {
      if (!el) return;
      el.classList.toggle("active", i === current);
    });
  }, [current]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const now = Timestamp.now();
        const q = query(
          collection(db, "publications"),
          where("category", "==", "news"),
          where("isPinned", "==", true),
          where("status", "==", "published"),
          where("publishDate", "<=", now),
          orderBy("publishDate", "desc")
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const d = snap.docs[0];
          setNews({ id: d.id, title: d.data().title });
        }
      } catch {
        console.error("Failed to fetch pinned news");
      }
    };
    fetch();
  }, []);

  return (
    <>
      <div className="slideshow-container">
        {slides.map((src, i) => (
          <div
            key={src}
            ref={(el) => { slideRefs.current[i] = el; }}
            className={`slide${i === 0 ? " active" : ""}`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
      </div>

      <div className="overlay">
        <div className="hero-container">
          <div className="hero-content animate-up">
            <p className="hero-org-subtitle">ENUGU STATE COMMAND</p>
            <h1 className="main-title">
              COMMUNITY AMBASSADOR FOR DEVELOPMENTAL AND ENGAGEMENT TECHNIQUES INITIATIVES.
            </h1>
            <p className="hero-tagline">
              "To build and secure the hope of youths in the society."
            </p>
            <div className="cta-cluster">
              <Link to="/recruit-reg" className="cta-btn btn-primary">
                <i className="fas fa-user-plus" /> JOIN US
              </Link>
              <Link to="/about#partnership" className="cta-btn btn-outline">
                <i className="fas fa-handshake" /> PARTNER WITH US
              </Link>
            </div>
          </div>
        </div>

        <div className="portal-strip">
          <div className="strip-container">
            <p>
              Already a Member?{" "}
              <Link to="/member-validation">Validate Service Number</Link>{" "}
              <Link to="/login">Access Portal Dashboard</Link>
            </p>
          </div>
        </div>

        {news && !dismissed && (
          <div className="news-widget">
            <small>PINNED NEWS</small>
            <h4>{news.title}</h4>
            <Link to={`/view?id=${news.id}`}>Read update &rarr;</Link>
            <button className="close-widget" onClick={() => setDismissed(true)}>
              &times;
            </button>
          </div>
        )}
      </div>
    </>
  );
}
