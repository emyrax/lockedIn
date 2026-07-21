import { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { formatDate, escapeHtml, truncate } from "../utils";

interface Post {
  id: string;
  title: string;
  content: string;
  coverUrl?: string;
  author?: string;
  publishDate?: any;
}

export default function Events() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const now = Timestamp.now();
        const q = query(
          collection(db, "publications"),
          where("category", "==", "event"),
          where("status", "==", "published"),
          where("publishDate", "<=", now),
          orderBy("publishDate", "asc")
        );
        const snap = await getDocs(q);
        const results: Post[] = [];
        snap.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() } as Post);
        });
        setPosts(results);
      } catch (e) {
        console.error("Failed to fetch events:", e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="media-hero events-hero">
        <div className="media-shell events-shell" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
          <p style={{ color: "#fff" }}>Loading events...</p>
        </div>
      </div>
    );
  }

  const go = (id: string) => { window.location.href = `/view?id=${id}`; };

  const monthName = (d: any) => {
    if (!d) return "";
    const date = typeof d.toDate === "function" ? d.toDate() : new Date(d);
    return date.toLocaleDateString(undefined, { month: "short" });
  };

  const dayNum = (d: any) => {
    if (!d) return "";
    const date = typeof d.toDate === "function" ? d.toDate() : new Date(d);
    return date.getDate();
  };

  return (
    <>
      <section className="media-hero events-hero">
        <div className="hero-content">
          <p className="hero-org">Calendar</p>
          <h1>Events</h1>
        </div>
      </section>

      <div className="media-shell events-shell">
        {posts.length === 0 ? (
          <div className="media-grid events-layout">
            <div className="empty-state">No upcoming events published yet.</div>
          </div>
        ) : (
          <div className="media-grid events-layout">
            {posts.map((p) => (
              <div className="event-card" key={p.id} onClick={() => go(p.id)}>
                <div className="event-date">
                  <span>{monthName(p.publishDate)}</span>
                  <strong>{dayNum(p.publishDate)}</strong>
                </div>
                {p.coverUrl && <img src={p.coverUrl} alt="" />}
                <div className="event-copy">
                  <span className="media-label">Programme</span>
                  <h3>{escapeHtml(p.title)}</h3>
                  <p>{truncate(p.content)}</p>
                  <small>{escapeHtml(p.author || "CADETI")}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
