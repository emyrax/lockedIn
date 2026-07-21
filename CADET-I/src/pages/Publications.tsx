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

export default function Publications() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const now = Timestamp.now();
        const q = query(
          collection(db, "publications"),
          where("category", "==", "article"),
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
        console.error("Failed to fetch articles:", e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="media-hero magazine-hero">
        <div className="media-shell magazine-shell" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
          <p style={{ color: "#fff" }}>Loading articles...</p>
        </div>
      </div>
    );
  }

  const go = (id: string) => { window.location.href = `/view?id=${id}`; };

  return (
    <>
      <section className="media-hero magazine-hero">
        <div className="hero-content">
          <p className="hero-org">Library</p>
          <h1>Articles &amp; Columns</h1>
        </div>
      </section>

      <div className="media-shell magazine-shell">
        {posts.length === 0 ? (
          <div className="media-grid magazine-layout">
            <div className="empty-state">No articles published yet.</div>
          </div>
        ) : (
          <div className="media-grid magazine-layout">
            {posts[0] && (
              <div className="magazine-feature" onClick={() => go(posts[0].id)}>
                {posts[0].coverUrl && <img src={posts[0].coverUrl} alt="" />}
                <div className="feature-copy">
                  <span className="media-label">Featured Essay</span>
                  <h2>{escapeHtml(posts[0].title)}</h2>
                  <p>{truncate(posts[0].content, 200)}</p>
                  <small>By {escapeHtml(posts[0].author || "CADETI")} &middot; {formatDate(posts[0].publishDate)}</small>
                </div>
              </div>
            )}

            {posts.length > 1 && (
              <div className="magazine-grid">
                {posts.slice(1).map((p, i) => (
                  <div
                    className={`magazine-card${(i + 1) % 3 === 0 ? " wide" : ""}`}
                    key={p.id}
                    onClick={() => go(p.id)}
                  >
                    {p.coverUrl && <img src={p.coverUrl} alt="" />}
                    <div>
                      <span>{formatDate(p.publishDate)}</span>
                      <h3>{escapeHtml(p.title)}</h3>
                      <p>{truncate(p.content)}</p>
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
