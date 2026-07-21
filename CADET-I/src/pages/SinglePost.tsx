import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { doc, getDoc, collection, query, where, orderBy, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { formatDate, escapeHtml } from "../utils";

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  coverUrl?: string;
  author?: string;
  publishDate?: any;
}

interface Comment {
  id: string;
  name: string;
  text: string;
  createdAt?: any;
}

export default function SinglePost() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [pinned, setPinned] = useState<{ id: string; title: string } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!id) { setLoading(false); return; }

    const fetchPost = async () => {
      try {
        const ref = doc(db, "publications", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setPost({ id: snap.id, ...snap.data() } as Post);
        }
      } catch (e) {
        console.error("Failed to fetch post:", e);
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const q = query(
          collection(db, "publications", id, "comments"),
          where("isApproved", "==", true)
        );
        const snap = await getDocs(q);
        const results: Comment[] = [];
        snap.forEach((d) => results.push({ id: d.id, ...d.data() } as Comment));
        setComments(results);
      } catch (e) {
        console.error("Failed to fetch comments:", e);
      }
    };

    const fetchPinned = async () => {
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
          setPinned({ id: d.id, title: d.data().title });
        }
      } catch {
        console.error("Failed to fetch pinned news");
      }
    };

    fetchPost();
    fetchComments();
    fetchPinned();
  }, [id]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim() || !id) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "publications", id, "comments"), {
        name: name.trim(),
        text: text.trim(),
        createdAt: Timestamp.now(),
        isApproved: false,
      });
      setSubmitted(true);
      setName("");
      setText("");
    } catch (e) {
      console.error("Failed to submit comment:", e);
    } finally {
      setSubmitting(false);
    }
  };

  if (!id) {
    return (
      <div className="article-container" style={{ textAlign: "center" }}>
        <p>No post specified.</p>
        <Link to="/news">Back to News</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="article-container" style={{ textAlign: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="article-container" style={{ textAlign: "center" }}>
        <p>Post not found.</p>
        <Link to="/news">Back to News</Link>
      </div>
    );
  }

  const url = window.location.href;
  const share = (platform: string) => {
    let u = "";
    if (platform === "whatsapp") u = `https://wa.me/?text=${encodeURIComponent(url)}`;
    else if (platform === "facebook") u = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    else if (platform === "x") u = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`;
    if (u) window.open(u, "_blank", "noopener");
  };

  return (
    <>
      <div className="article-container">
        <div className="article-header">
          <span className="post-label">{escapeHtml(post.category)}</span>
          <h1>{escapeHtml(post.title)}</h1>
          <p className="post-meta">
            {escapeHtml(post.author || "CADETI")} &middot; {formatDate(post.publishDate)}
          </p>
        </div>

        {post.coverUrl && (
          <div className="article-cover" style={{ backgroundImage: `url(${post.coverUrl})` }} />
        )}

        <div className="article-body" dangerouslySetInnerHTML={{ __html: post.content }} />

        <div className="share-strip">
          <span>Share this article</span>
          <div className="share-buttons">
            <button onClick={() => share("whatsapp")} title="Share on WhatsApp"><i className="fab fa-whatsapp" /></button>
            <button onClick={() => share("facebook")} title="Share on Facebook"><i className="fab fa-facebook-f" /></button>
            <button onClick={() => share("x")} title="Share on X"><i className="fab fa-x-twitter" /></button>
          </div>
        </div>

        <div className="comment-section">
          <h3>Comments</h3>

          {comments.length > 0 ? (
            <div className="comment-list">
              {comments.map((c) => (
                <div className="comment" key={c.id}>
                  <strong>{escapeHtml(c.name)}</strong>
                  <p>{escapeHtml(c.text)}</p>
                  <small>{c.createdAt ? formatDate(c.createdAt) : ""}</small>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#607060", margin: "18px 0" }}>No comments yet. Be the first to share your thoughts.</p>
          )}

          {submitted ? (
            <p style={{ color: "#155724", background: "#d4edda", padding: "12px 18px" }}>
              Thank you! Your comment has been submitted for review.
            </p>
          ) : (
            <form className="comment-input-area" onSubmit={handleComment}>
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <textarea
                placeholder="Write your comment..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
              <button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Post Comment"}
              </button>
            </form>
          )}
        </div>
      </div>

      {pinned && !dismissed && (
        <div className="news-widget">
          <small>PINNED NEWS</small>
          <h4>{pinned.title}</h4>
          <Link to={`/view?id=${pinned.id}`}>Read update &rarr;</Link>
          <button className="close-widget" onClick={() => setDismissed(true)}>
            &times;
          </button>
        </div>
      )}
    </>
  );
}
