import { useEffect, useState } from "react";
import { GOOGLE_SHEETS_API } from "../config/firebase";

interface Activity {
  id: number;
  sdgIcon?: string;
  month: string;
  theme: string;
  description: string;
  status: string;
}

export default function About() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.15 }
    );

    const reveals = document.querySelectorAll(".reveal");
    reveals.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch(`${GOOGLE_SHEETS_API}?action=getActivities`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setActivities(data);
      } catch {
        setError("Could not load operational roadmap.");
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  useEffect(() => {
    if (!loading) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("active");
            }
          });
        },
        { threshold: 0.15 }
      );

      const reveals = document.querySelectorAll(".reveal");
      reveals.forEach((el) => observer.observe(el));

      return () => observer.disconnect();
    }
  }, [loading]);

  return (
    <div className="main-wrapper">
      {/* HERO */}
      <section className="about-hero">
        <div className="hero-content">
          <p className="hero-org">ENUGU STATE COMMAND</p>
          <h1>COMMUNITY AMBASSADOR FOR DEVELOPMENTAL ENGAGEMENT TECHNIQUES INITIATIVE.</h1>
          <p className="hero-tag">"To build and secure the hope of youths in the society."</p>
        </div>
      </section>

      {/* CORE MANDATES */}
      <section className="white-bg section-padding">
        <div className="container text-center">
          <h2 className="section-heading">Our Core Mandates</h2>
          <div className="pillars-grid">
            <div className="pillar-card reveal">
              <i className="fas fa-graduation-cap" />
              <h4>Youth Development &amp; Leadership</h4>
              <p>Empowering young people with leadership skills, civic education, and character development for a better society.</p>
            </div>
            <div className="pillar-card reveal">
              <i className="fas fa-hand-holding-heart" />
              <h4>Community Service &amp; National Development</h4>
              <p>Engaging in community development projects and volunteer initiatives that drive positive change across the nation.</p>
            </div>
            <div className="pillar-card reveal">
              <i className="fas fa-user-shield" />
              <h4>Security Support &amp; Public Safety</h4>
              <p>Supporting public safety efforts through security awareness campaigns and collaboration with law enforcement agencies.</p>
            </div>
            <div className="pillar-card reveal">
              <i className="fas fa-handshake" />
              <h4>National Unity &amp; Social Cohesion</h4>
              <p>Promoting unity, peace, and social harmony among diverse communities through inclusive programs and dialogue.</p>
            </div>
          </div>
        </div>
      </section>

      {/* VISION & MISSION */}
      <section className="gray-bg section-padding">
        <div className="container">
          <div className="vm-grid">
            <div className="vm-card reveal">
              <h3 className="accent-title">Our Vision</h3>
              <p>To be a world-class youth leadership organization that produces disciplined, civic-minded, and self-reliant young leaders who contribute meaningfully to national development and global peace.</p>
            </div>
            <div className="vm-card red-border reveal">
              <h3 className="accent-title">Our Mission</h3>
              <p>To develop a generation of disciplined and civic-minded youth leaders through structured training, community engagement, and character formation programs that foster patriotism and national unity.</p>
            </div>
          </div>
        </div>
      </section>

      {/* OBJECTIVES, UNITS & RANK HIERARCHY */}
      <section className="white-bg section-padding">
        <div className="container">
          <div className="split-grid">
            {/* LEFT COLUMN */}
            <div>
              <h3 className="side-heading reveal">Primary Objectives</h3>
              <ul className="icon-list reveal">
                <li><i className="fas fa-medal" /> Promote youth leadership and civic responsibility through structured training programs.</li>
                <li><i className="fas fa-building-shield" /> Establish a disciplined paramilitary youth corps that supports national security awareness.</li>
                <li><i className="fas fa-truck-medical" /> Provide humanitarian aid and emergency response support during national crises.</li>
                <li><i className="fas fa-briefcase" /> Create economic empowerment opportunities and vocational skills development for youths.</li>
                <li><i className="fas fa-person-military-pointing" /> Foster patriotism and respect for national symbols and democratic values.</li>
                <li><i className="fas fa-globe" /> Build strategic partnerships with domestic and international development organizations.</li>
              </ul>

              <h3 className="side-heading reveal" style={{ marginTop: 40 }}>Operational Units</h3>
              <p className="unit-subtext reveal">Specialized units driving our mission across the nation.</p>
              <div className="units-grid reveal">
                <div className="unit-item"><i className="fas fa-book-open" /><span>TRADOC</span></div>
                <div className="unit-item"><i className="fas fa-shield-halved" /><span>Cadet Police</span></div>
                <div className="unit-item"><i className="fas fa-paw" /><span>Lion Strikers</span></div>
                <div className="unit-item"><i className="fas fa-skull" /><span>Special Squad</span></div>
                <div className="unit-item"><i className="fas fa-newspaper" /><span>Media &amp; Pubs</span></div>
                <div className="unit-item"><i className="fas fa-music" /><span>The Band</span></div>
                <div className="unit-item"><i className="fas fa-truck-medical" /><span>Medical Corps</span></div>
                <div className="unit-item"><i className="fas fa-helmet-safety" /><span>Regular Duties</span></div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="rank-hierarchy reveal">
              <h3 className="side-heading" style={{ borderLeftColor: "green" }}>Official Rank Structure</h3>

              <div className="rank-group">
                <p className="rank-category-title"><i className="fas fa-star" /> Commissioned Officers</p>
                <div className="rank-ladder-container">
                  <div className="rank-step top-rank">Brigade Commander</div>
                  <div className="rank-step">Deputy Brigade Commander</div>
                  <div className="rank-step">Commandant</div>
                  <div className="rank-step">Deputy Commandant</div>
                  <div className="rank-step">Superintendent I</div>
                  <div className="rank-step">Superintendent II</div>
                  <div className="rank-step">Assistant Superintendent I</div>
                </div>
              </div>

              <div className="rank-group" style={{ marginTop: 20 }}>
                <p className="rank-category-title nco-title"><i className="fas fa-chevrons-up" /> Non-Commissioned Officers</p>
                <div className="rank-ladder-container">
                  <div className="rank-step nco-step">Inspector</div>
                  <div className="rank-step nco-step">Sergeant Major</div>
                  <div className="rank-step nco-step">Sergeant</div>
                  <div className="rank-step nco-step">Corporal</div>
                  <div className="rank-step nco-step">Lance Corporal</div>
                  <div className="rank-step nco-step base-rank">Private</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHAIN OF COMMAND */}
      <section className="gray-bg section-padding">
        <div className="container text-center">
          <h2 className="section-heading reveal">Chain of Command</h2>
          <div className="command-chain-container reveal">
            <div className="chain-step"><span>1</span><p>National Command</p></div>
            <span className="chain-arrow"><i className="fas fa-chevron-right" /></span>
            <div className="chain-step"><span>2</span><p>Zonal Command</p></div>
            <span className="chain-arrow"><i className="fas fa-chevron-right" /></span>
            <div className="chain-step"><span>3</span><p>State Command</p></div>
            <span className="chain-arrow"><i className="fas fa-chevron-right" /></span>
            <div className="chain-step"><span>4</span><p>Regional Command</p></div>
            <span className="chain-arrow"><i className="fas fa-chevron-right" /></span>
            <div className="chain-step"><span>5</span><p>Area Command</p></div>
            <span className="chain-arrow"><i className="fas fa-chevron-right" /></span>
            <div className="chain-step unit-final"><span>6</span><p>Unit Command</p></div>
          </div>
        </div>
      </section>

      {/* ENUGU STATE EXECUTIVE COUNCIL */}
      <section className="gray-bg section-padding" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2 className="section-heading text-center reveal">Enugu State Executive Council</h2>
          <p className="text-center reveal" style={{ color: "#607060", padding: "60px 20px", fontSize: "1.05rem" }}>
            Enugu State Executive Council information will be available soon.
          </p>
        </div>
      </section>

      {/* 2026 OPERATIONAL ROADMAP */}
      <section className="white-bg section-padding">
        <div className="container">
          <h2 className="section-heading text-center reveal">2026 Operational Roadmap</h2>

          {loading && (
            <p className="text-center" style={{ color: "#607060" }}>Loading roadmap...</p>
          )}

          {error && (
            <p className="text-center" style={{ color: "red" }}>{error}</p>
          )}

          {!loading && !error && activities.length === 0 && (
            <p className="text-center" style={{ color: "#607060" }}>No activities published yet.</p>
          )}

          {!loading && !error && activities.length > 0 && (
            <div className="activity-grid">
              {activities.map((a) => (
                <div className="roadmap-card reveal" key={a.id}>
                  {a.sdgIcon && <i className={`fas ${a.sdgIcon}`} style={{ color: "green", fontSize: "1.8rem", marginBottom: 12 }} />}
                  <h4 style={{ color: "#002b05", marginBottom: 6, fontFamily: "Montserrat, sans-serif" }}>
                    {a.month} — {a.theme}
                  </h4>
                  <p style={{ color: "#5e6a61", fontSize: "0.94rem", lineHeight: 1.7, marginBottom: 12 }}>{a.description}</p>
                  <span style={{
                    display: "inline-block",
                    padding: "4px 14px",
                    borderRadius: 20,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    background: a.status === "completed" ? "#d4edda" : a.status === "ongoing" ? "#fff3cd" : "#e2e3e5",
                    color: a.status === "completed" ? "#155724" : a.status === "ongoing" ? "#856404" : "#383d41",
                  }}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
