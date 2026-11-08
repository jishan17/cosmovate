
"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  addApplicationNote,
  getApplicationNotes,
  updateApplicationStatus,
} from "./actions";

type Application = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  department: string;
  linkedin_url: string | null;
  status: string;
  created_at: string;
};

type Note = {
  id: string;
  application_id: string;
  author_id: string;
  note: string;
  created_at: string;
};

const departments = [
  "Design",
  "Event Management",
  "Marketing",
  "Public Relations (PR) and Logistics",
  "Research",
  "Social Media",
  "Technical",
];

const statuses = ["Pending", "Shortlisted", "Accepted", "Rejected"];

function statusStyle(status: string) {
  switch (status) {
    case "Accepted":
      return "border-emerald-400/20 bg-emerald-500/10 text-emerald-300";
    case "Shortlisted":
      return "border-blue-400/20 bg-blue-500/10 text-blue-300";
    case "Rejected":
      return "border-red-400/20 bg-red-500/10 text-red-300";
    default:
      return "border-amber-400/20 bg-amber-500/10 text-amber-300";
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ApplicationManager({
  initialApplications,
  role,
}: {
  initialApplications: Application[];
  role: string;
}) {
  const [applications, setApplications] = useState(initialApplications);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [status, setStatus] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  const canUpdateStatus = role === "super_admin" || role === "admin";

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesSearch =
        !query ||
        application.full_name.toLowerCase().includes(query) ||
        application.email.toLowerCase().includes(query);

      const matchesDepartment =
        department === "All" || application.department === department;

      const matchesStatus =
        status === "All" || application.status === status;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [applications, search, department, status]);

  const selectedApplication =
    applications.find((application) => application.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedId) {
      setNotes([]);
      return;
    }

    let cancelled = false;

    async function loadNotes() {
      setLoadingNotes(true);
      setError("");

      try {
        const result = await getApplicationNotes(selectedId!);

        if (!cancelled) setNotes(result);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load notes."
          );
        }
      } finally {
        if (!cancelled) setLoadingNotes(false);
      }
    }

    loadNotes();

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  function changeStatus(applicationId: string, newStatus: string) {
    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        await updateApplicationStatus(applicationId, newStatus);

        setApplications((current) =>
          current.map((application) =>
            application.id === applicationId
              ? { ...application, status: newStatus }
              : application
          )
        );

        setSuccess("Application status updated successfully.");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to update status."
        );
      }
    });
  }

  function submitNote() {
    if (!selectedApplication || !newNote.trim()) return;

    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        await addApplicationNote(selectedApplication.id, newNote);

        setNewNote("");

        const updatedNotes = await getApplicationNotes(
          selectedApplication.id
        );

        setNotes(updatedNotes);
        setSuccess("Internal note added successfully.");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to save note."
        );
      }
    });
  }

  return (
    <div>
      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Total", applications.length],
          ["Pending", applications.filter((a) => a.status === "Pending").length],
          [
            "Shortlisted",
            applications.filter((a) => a.status === "Shortlisted").length,
          ],
          [
            "Accepted",
            applications.filter((a) => a.status === "Accepted").length,
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-white/10 bg-[#0b1b32] p-4"
          >
            <p className="text-xs text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0b1b32] p-4 sm:p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold">Applicant directory</h2>
          <p className="mt-1 text-sm text-slate-400">
            Search, filter and review membership applications.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name or email..."
            className="min-w-0 rounded-xl border border-white/10 bg-[#061326] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400"
          />

          <select
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            className="rounded-xl border border-white/10 bg-[#061326] px-4 py-3 text-sm text-white outline-none focus:border-blue-400"
          >
            <option value="All">All departments</option>
            {departments.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-white/10 bg-[#061326] px-4 py-3 text-sm text-white outline-none focus:border-blue-400"
          >
            <option value="All">All statuses</option>
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 flex items-center justify-between text-xs text-slate-400">
          <span>{filteredApplications.length} applicants found</span>
          <span>{role.replace("_", " ")}</span>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-4">Applicant</th>
                <th className="px-3 py-4">Department</th>
                <th className="px-3 py-4">Submitted</th>
                <th className="px-3 py-4">Status</th>
                <th className="px-3 py-4">Details</th>
              </tr>
            </thead>

            <tbody>
              {filteredApplications.map((application) => (
                <tr
                  key={application.id}
                  className={`border-b border-white/5 transition hover:bg-white/[0.03] ${
                    selectedId === application.id ? "bg-blue-500/[0.07]" : ""
                  }`}
                >
                  <td className="px-3 py-4">
                    <p className="font-medium text-white">
                      {application.full_name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {application.email}
                    </p>
                  </td>

                  <td className="px-3 py-4 text-slate-300">
                    {application.department}
                  </td>

                  <td className="px-3 py-4 text-xs text-slate-400">
                    {new Date(application.created_at).toLocaleDateString(
                      "en-IN"
                    )}
                  </td>

                  <td className="px-3 py-4">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1.5 text-xs ${statusStyle(
                        application.status
                      )}`}
                    >
                      {application.status}
                    </span>
                  </td>

                  <td className="px-3 py-4">
                    <button
                      onClick={() => setSelectedId(application.id)}
                      className="text-xs font-semibold text-blue-300 hover:text-white"
                    >
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredApplications.length === 0 && (
            <div className="py-14 text-center">
              <p className="text-slate-300">No applicants found.</p>
              <p className="mt-2 text-xs text-slate-500">
                Try changing your search or filters.
              </p>
            </div>
          )}
        </div>
      </section>

      {selectedApplication && (
        <section className="mt-6 rounded-2xl border border-blue-400/20 bg-[#0b1b32] p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-blue-300">
                APPLICANT PROFILE
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                {selectedApplication.full_name}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Submitted {formatDate(selectedApplication.created_at)}
              </p>
            </div>

            <button
              onClick={() => setSelectedId(null)}
              className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5"
            >
              Close ×
            </button>
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            {[
              ["Email address", selectedApplication.email],
              ["Phone number", selectedApplication.phone],
              ["Department", selectedApplication.department],
              ["Application ID", selectedApplication.id],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-2 break-all text-sm text-slate-200">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <p className="text-xs text-slate-500">LinkedIn profile</p>
            {selectedApplication.linkedin_url ? (
              <a
                href={selectedApplication.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block break-all text-sm text-blue-300 hover:text-white"
              >
                Open LinkedIn profile ↗
              </a>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                Not provided
              </p>
            )}
          </div>

          <div className="mt-7 border-t border-white/10 pt-6">
            <h3 className="font-semibold">Application status</h3>

            {canUpdateStatus ? (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <select
                  value={selectedApplication.status}
                  disabled={isPending}
                  onChange={(event) =>
                    changeStatus(selectedApplication.id, event.target.value)
                  }
                  className="rounded-xl border border-white/10 bg-[#061326] px-4 py-3 text-sm text-white outline-none focus:border-blue-400 disabled:opacity-50"
                >
                  {statuses.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <span className="text-xs text-slate-500">
                  Admin and Super Admin permissions
                </span>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-400">
                {selectedApplication.status} · Reviewer access is read-only.
              </p>
            )}
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <div>
              <h3 className="text-lg font-semibold">Internal reviewer notes</h3>
              <p className="mt-1 text-xs text-slate-500">
                Private team discussion. Not visible to applicants.
              </p>
            </div>

            <div className="mt-5">
              <textarea
                value={newNote}
                onChange={(event) => setNewNote(event.target.value)}
                maxLength={5000}
                rows={4}
                placeholder="Write an internal review note..."
                className="w-full resize-y rounded-xl border border-white/10 bg-[#061326] p-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400"
              />

              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  {newNote.length}/5000 characters
                </span>

                <button
                  onClick={submitNote}
                  disabled={!newNote.trim() || isPending}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isPending ? "Saving..." : "Add internal note"}
                </button>
              </div>
            </div>

            <div className="mt-7 space-y-3">
              {loadingNotes ? (
                <p className="text-sm text-slate-400">Loading notes...</p>
              ) : notes.length === 0 ? (
                <p className="rounded-xl border border-white/5 p-5 text-center text-sm text-slate-500">
                  No internal notes yet.
                </p>
              ) : (
                notes.map((note) => (
                  <article
                    key={note.id}
                    className="rounded-xl border border-white/10 bg-[#061326] p-4"
                  >
                    <div className="flex flex-wrap justify-between gap-2">
                      <span className="text-xs font-semibold text-blue-300">
                        Team member
                      </span>
                      <time className="text-xs text-slate-500">
                        {formatDate(note.created_at)}
                      </time>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-300">
                      {note.note}
                    </p>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-300"
        >
          {success}
        </div>
      )}
    </div>
  );
}
