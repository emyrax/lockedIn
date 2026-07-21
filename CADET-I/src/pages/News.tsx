import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

export default function News() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const now = Timestamp.now();
        const q = query(
          collection(db, "publications"),
          where("category", "==", "news"),
          where("status", "==", "published"),
          where("publishDate", "<=", now),
          orderBy("publishDate", "desc")
        );
        const snap = await getDocs(q);
        const results: Post[] = [];
        snap.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() } as Post);
        });
        setPosts(results);
      } catch (e) {
        console.error("Failed to fetch news:", e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="media-hero">
        <div className="media-shell" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
          <p style={{ color: "#fff" }}>Loading news...</p>
        </div>
      </div>
    );
  }

  const go = (id: string) => { window.location.href = `/view?id=${id}`; };

  return (
    <>
      <section className="media-hero">
        <div className="hero-content">
          <p className="hero-org">Media Center</p>
          <h1>Command News</h1>
        </div>
      </section>

      <div className="media-shell newsroom-shell">
        <div className="section-kicker">
          <span>Latest Briefings</span>
          <strong>CADETI News Desk</strong>
        </div>

        {posts.length === 0 ? (
          <div className="media-grid news-layout">
            <div className="empty-state">No news articles published yet.</div>
          </div>
        ) : (
          <div className="media-grid news-layout">
            {posts[0] && (
              <div className="lead-story" onClick={() => go(posts[0].id)}>
                {posts[0].coverUrl && <img src={posts[0].coverUrl} alt="" />}
                <div className="lead-copy">
                  <span className="media-label">Top Story</span>
                  <h2>{escapeHtml(posts[0].title)}</h2>
                  <p>{truncate(posts[0].content, 200)}</p>
                  <small>{formatDate(posts[0].publishDate)} &middot; {escapeHtml(posts[0].author || "CADETI")}</small>
                </div>
              </div>
            )}

            {posts.length > 1 && (
              <div className="news-side">
                {posts.slice(1, 3).map((p) => (
                  <div className="side-story" key={p.id} onClick={() => go(p.id)}>
                    {p.coverUrl && <img src={p.coverUrl} alt="" />}
                    <div>
                      <span>{formatDate(p.publishDate)}</span>
                      <h3>{escapeHtml(p.title)}</h3>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {posts.length > 3 && (
              <div className="latest-strip">
                {posts.slice(3).map((p) => (
                  <div className="news-row" key={p.id} onClick={() => go(p.id)}>
                    {p.coverUrl && <img src={p.coverUrl} alt="" />}
                    <div>
                      <h3>{escapeHtml(p.title)}</h3>
                      <p>{truncate(p.content)}</p>
                      <small>{formatDate(p.publishDate)} &middot; {escapeHtml(p.author || "CADETI")}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
