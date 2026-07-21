import { useState, useEffect } from "react";
import { db, FORMSPREE_URL } from "../config/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function Contact() {
  const [form, setForm] = useState({
    msgName: "",
    msgEmail: "",
    msgSubject: "",
    msgBody: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    document.body.classList.add("contact-page");
    return () => document.body.classList.remove("contact-page");
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const toggleFaq = (index: number) => {
    setActiveFaq((prev) => (prev === index ? null : index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const payload = {
      name: form.msgName,
      email: form.msgEmail,
      subject: form.msgSubject,
      message: form.msgBody,
      _subject: `[CADET-I Contact] ${form.msgSubject}`,
      source: "contact-page",
      submittedAt: new Date().toISOString(),
    };

    try {
      const [res] = await Promise.all([
        fetch(FORMSPREE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
        addDoc(collection(db, "contact_messages"), {
          ...payload,
          to: "cadetinitiative1@gmail.com",
          status: "submitted",
          createdAt: serverTimestamp(),
        }),
      ]);

      if (!res.ok) throw new Error("Form submission failed");

      setStatus({
        type: "success",
        message:
          "Message transmitted successfully. National Command will respond shortly.",
      });
      setForm({ msgName: "", msgEmail: "", msgSubject: "", msgBody: "" });
    } catch {
      setStatus({
        type: "error",
        message:
          "Transmission failed. Please try again or email us directly.",
      });
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      q: "How do I become a CADETI member?",
      a: 'New applicants should visit the <a href="/signup" style="color:var(--primary-green);font-weight:700">Join Cadet</a> page and complete the online registration. Ensure you meet the eligibility criteria and have a valid government-issued ID.',
    },
    {
      q: "I lost my Service Number, what should I do?",
      a: 'Use the <a href="/login" style="color:var(--primary-green);font-weight:700">Forgot Password</a> link on the login page to retrieve your credentials. You will need the email address associated with your profile.',
    },
    {
      q: "Is there a training fee?",
      a: "CADETI training structures vary by state command. Basic enrollment is free for qualifying candidates. Specialized courses and advanced training programs may have nominal fees. Contact your state command for details.",
    },
  ];

  const infoCards = [
    {
      icon: "fa-envelope-open-text",
      title: "Official Email",
      value: "cadetinitiative1@gmail.com",
      href: "mailto:cadetinitiative1@gmail.com",
    },
    {
      icon: "fa-whatsapp",
      title: "WhatsApp Support",
      value: "+234 701-1888-770",
      href: "https://wa.me/2347011888770",
    },
  ];

  return (
    <div className="main-wrapper">
      <section className="contact-hero">
        <div className="hero-content">
          <p className="hero-org">National Headquarters</p>
          <h1
            style={{
              color: "#fff",
              fontSize: "clamp(2rem,4.8vw,4rem)",
              lineHeight: 1.08,
              marginBottom: 16,
            }}
          >
            Contact &amp; Support
          </h1>
          <p className="hero-tag">
            Direct communication to National Command
          </p>
        </div>
      </section>

      <section className="contact-main section-padding">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info-area">
              <div className="faq-accordion">
                {faqs.map((faq, i) => (
                  <div
                    className={`faq-item ${activeFaq === i ? "active" : ""}`}
                    key={i}
                  >
                    <button
                      className="faq-question"
                      onClick={() => toggleFaq(i)}
                      type="button"
                    >
                      <span>{faq.q}</span>
                      <i className="fas fa-plus" />
                    </button>
                    <div className="faq-answer">
                      <p dangerouslySetInnerHTML={{ __html: faq.a }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="direct-contact-cards">
                {infoCards.map((card, i) => (
                  <div className="info-card" key={i}>
                    <i className={`fas ${card.icon}`} />
                    <div>
                      <h4>{card.title}</h4>
                      <a href={card.href}>{card.value}</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="message-form-area">
              <div className="form-container contact-form-card">
                <h3>Send a Message</h3>
                <p className="subtitle">
                  Direct communication to National Command
                </p>

                <form id="contactMsgForm" onSubmit={handleSubmit}>
                  <label htmlFor="msgName">Full Name</label>
                  <input
                    id="msgName"
                    type="text"
                    value={form.msgName}
                    onChange={handleChange}
                    required
                  />

                  <label htmlFor="msgEmail">Email Address</label>
                  <input
                    id="msgEmail"
                    type="email"
                    value={form.msgEmail}
                    onChange={handleChange}
                    required
                  />

                  <label htmlFor="msgSubject">Subject</label>
                  <input
                    id="msgSubject"
                    type="text"
                    value={form.msgSubject}
                    onChange={handleChange}
                    required
                  />

                  <label htmlFor="msgBody">Message</label>
                  <textarea
                    id="msgBody"
                    value={form.msgBody}
                    onChange={handleChange}
                    required
                  />

                  <button
                    id="submitMsgBtn"
                    type="submit"
                    disabled={loading}
                    className={loading ? "loading" : ""}
                  >
                    <span className="btn-text">Transmit Message</span>
                    <span className="spinner" />
                  </button>

                  {status && (
                    <div
                      className="status-box"
                      style={{
                        background:
                          status.type === "success" ? "#eaffea" : "#ffeaea",
                        color:
                          status.type === "success"
                            ? "var(--primary-green)"
                            : "red",
                        border: `2px solid ${
                          status.type === "success"
                            ? "var(--primary-green)"
                            : "red"
                        }`,
                      }}
                    >
                      {status.message}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
