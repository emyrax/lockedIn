import { useEffect, useState } from "react";
import { GOOGLE_SHEETS_API } from "../config/firebase";
import { getGoogleDriveUrl } from "../utils";

interface GalleryItem {
  url?: string;
  URL?: string;
  imageUrl?: string;
  category?: string;
  Category?: string;
  caption?: string;
  Caption?: string;
  title?: string;
  Title?: string;
}

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filter, setFilter] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch(`${GOOGLE_SHEETS_API}?action=getGallery`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.data ?? [];
        setItems(list);
        const cats = [
          ...new Set(
            list.map((item: GalleryItem) =>
              (item.category || item.Category || "Uncategorized").trim()
            )
          ),
        ] as string[];
        setCategories(cats);
      } catch {
        setError("Could not load gallery.");
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const getUrl = (item: GalleryItem) =>
    getGoogleDriveUrl(item.url || item.URL || item.imageUrl || "");

  const getCategory = (item: GalleryItem) =>
    (item.category || item.Category || "Uncategorized").trim();

  const getCaption = (item: GalleryItem) =>
    item.caption || item.Caption || item.title || item.Title || "";

  const filtered =
    filter === "all"
      ? items
      : items.filter((item) => getCategory(item) === filter);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const parent = (e.target as HTMLElement).closest(".gallery-card");
    if (parent) parent.classList.add("image-failed");
  };

  return (
    <div className="main-wrapper gallery-page">
      <section className="about-hero">
        <div className="hero-content">
          <p className="hero-org">National Archives</p>
          <h1>OFFICIAL PHOTO GALLERY</h1>
          <p className="hero-tag">Documenting our journey...</p>
        </div>
      </section>

      <div className="filter-section">
        <div className="container">
          <div className="filter-container">
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-btn ${filter === cat ? "active" : ""}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        {loading && (
          <p className="text-center" style={{ color: "#607060", padding: 40 }}>
            Loading gallery...
          </p>
        )}
        {error && (
          <p className="text-center" style={{ color: "red", padding: 40 }}>
            {error}
          </p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <p className="text-center" style={{ color: "#607060", padding: 40 }}>
            No images found.
          </p>
        )}
        {!loading && !error && filtered.length > 0 && (
          <div className="gallery-grid">
            {filtered.map((item, i) => (
              <div className="gallery-item" key={i}>
                <div
                  className="gallery-card"
                  onClick={() => setLightbox(getUrl(item))}
                >
                  <img
                    src={getUrl(item)}
                    alt={getCaption(item) || "Gallery image"}
                    loading="lazy"
                    onError={handleImageError}
                  />
                  <div className="gallery-overlay">
                    <i className="fas fa-expand" />
                    <span>{getCategory(item)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        className={`lightbox ${lightbox ? "active" : ""}`}
        onClick={() => setLightbox(null)}
      >
        <span className="close-lightbox" onClick={() => setLightbox(null)}>
          &times;
        </span>
        {lightbox && (
          <img
            className="lightbox-content"
            src={lightbox}
            alt="Expanded view"
          />
        )}
      </div>
    </div>
  );
}
