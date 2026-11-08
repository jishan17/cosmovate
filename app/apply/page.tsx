"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const departments = [
  "Design",
  "Event Management",
  "Marketing",
  "Public Relations (PR) and Logistics",
  "Research",
  "Social Media",
  "Technical",
];

export default function ApplyPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (linkedin.trim() && !/^https?:\/\//i.test(linkedin.trim())) {
      setMessage({ type: "error", text: "Please enter your LinkedIn profile as a full URL beginning with https://" });
      return;
    }

    setSubmitting(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from("applications").insert({
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        department,
        linkedin_url: linkedin.trim() || null,
      });

      if (error) throw error;

      setMessage({ type: "success", text: "Your application has been submitted successfully. Thank you for your interest in COSMOVATE!" });
      setFullName("");
      setPhone("");
      setEmail("");
      setDepartment("");
      setLinkedin("");
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unknown error";
      setMessage({ type: "error", text: `We couldn't submit your application. ${detail}` });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="apply-page">
      <div className="apply-shell">
        <div className="apply-topbar">
          <Link href="/" className="apply-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/cosmovate-logo.png" alt="" />
            <span>COSMOVATE</span>
          </Link>
          <Link href="/#join" className="apply-back">← BACK TO WEBSITE</Link>
        </div>

        <span className="apply-eyebrow">RECRUITMENT / APPLICATIONS OPEN</span>
        <h1 className="apply-heading">FIND YOUR PLACE.<br /><span>SHAPE THE FUTURE.</span></h1>
        <p className="apply-intro">Bring your curiosity, ideas and perspective to COSMOVATE. Choose the department where you'd like to contribute and submit your application below.</p>

        <section className="apply-card" aria-label="COSMOVATE membership application">
          {message && <div className={`apply-message${message.type === "error" ? " apply-error" : ""}`} role="status">{message.text}</div>}
          <form className="apply-form" onSubmit={handleSubmit}>
            <div className="apply-field">
              <label htmlFor="fullName">Full name <span>*</span></label>
              <input id="fullName" name="fullName" autoComplete="name" required minLength={2} maxLength={100} placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="apply-field">
              <label htmlFor="phone">Phone number <span>*</span></label>
              <input id="phone" name="phone" type="tel" autoComplete="tel" required minLength={7} maxLength={20} placeholder="Enter your phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="apply-field">
              <label htmlFor="email">Email address <span>*</span></label>
              <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="apply-field">
              <label htmlFor="department">Field of interest <span>*</span></label>
              <select id="department" name="department" required value={department} onChange={(e) => setDepartment(e.target.value)}>
                <option value="" disabled>Select a department</option>
                {departments.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div className="apply-field">
              <label htmlFor="linkedin">LinkedIn profile <small>(optional)</small></label>
              <input id="linkedin" name="linkedin" type="url" autoComplete="url" maxLength={500} placeholder="https://www.linkedin.com/in/your-profile" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
              <small>Share your LinkedIn profile if you have one.</small>
            </div>
            <button className="apply-submit" type="submit" disabled={submitting}>{submitting ? "SUBMITTING APPLICATION…" : "SUBMIT APPLICATION  ↗"}</button>
          </form>
          <p className="apply-privacy">Your details will be used only to review your COSMOVATE recruitment application.</p>
        </section>
        <p className="apply-footer">EXPLORE. INNOVATE. INSPIRE. ✦</p>
      </div>
    </main>
  );
}
