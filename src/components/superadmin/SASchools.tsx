"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Building2,
  Pencil,
  Trash2,
  ArrowRight,
  Search,
  X,
  Loader2,
  GraduationCap,
  UserCheck,
  LayoutGrid,
} from "lucide-react";
import { useSuperAdmin, CreateSchoolData } from "@/context/SuperAdminContext";
import { School } from "@/context/AppContext";

interface Props {
  onViewSchool: (school: School) => void;
  showCreateModal?: boolean;
}

const BLANK_CREATE: CreateSchoolData = {
  name: "",
  code: "",
  themeColor: "#4F46E5",
  adminName: "",
  adminEmail: "",
  adminPassword: "",
};

const THEME_PRESETS = [
  "#4F46E5", "#7C3AED", "#DB2777", "#DC2626",
  "#EA580C", "#D97706", "#16A34A", "#0284C7",
];

export default function SASchools({ onViewSchool, showCreateModal }: Props) {
  const { schools, schoolStats, loadSchoolStats, createSchool, updateSchool, deleteSchool, showAlert } =
    useSuperAdmin();

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(showCreateModal ?? false);
  const [editSchool, setEditSchool] = useState<School | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<School | null>(null);

  const [createForm, setCreateForm] = useState<CreateSchoolData>(BLANK_CREATE);
  const [editForm, setEditForm] = useState({ name: "", themeColor: "#4F46E5" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    schools.forEach((s) => {
      if (!schoolStats[s.id]) loadSchoolStats(s.id);
    });
  }, [schools]);

  useEffect(() => {
    if (showCreateModal) {
      setShowCreate(true);
    }
  }, [showCreateModal]);

  const filtered = schools.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (createForm.adminPassword.length < 6) {
      setFormError("Admin password must be at least 6 characters.");
      return;
    }
    if (schools.some((s) => s.code === createForm.code.toUpperCase())) {
      setFormError("A school with this code already exists.");
      return;
    }
    setSaving(true);
    try {
      await createSchool(createForm);
      setShowCreate(false);
      setCreateForm(BLANK_CREATE);
      showAlert("School created", `${createForm.name} is now live.`, "success");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to create school";
      setFormError(msg.includes("email-already-in-use") ? "Admin email is already in use." : msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSchool) return;
    setSaving(true);
    try {
      await updateSchool(editSchool.id, editForm);
      setEditSchool(null);
      showAlert("School updated", `${editForm.name} has been updated.`, "success");
    } catch {
      showAlert("Error", "Failed to update school.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSchool(deleteTarget.id);
      setDeleteTarget(null);
      showAlert("School deleted", `${deleteTarget.name} has been removed.`, "success");
    } catch {
      showAlert("Error", "Failed to delete school.", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">School Management</h1>
        <p className="text-slate-500">Create and manage all registered schools in the platform</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schools by name or code…"
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>
        <button
          onClick={() => { setShowCreate(true); setFormError(""); }}
          className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-500/25"
        >
          <Plus className="w-4 h-4" />
          New School
        </button>
      </div>

      {/* Schools Table */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              {search ? "No schools found" : "No schools yet"}
            </h3>
            <p className="text-slate-500 mb-6">
              {search ? "Try adjusting your search terms" : "Create your first school to get started"}
            </p>
            {!search && (
              <button
                onClick={() => { setShowCreate(true); setFormError(""); }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                Create School
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* Table header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">
                  {filtered.length} school{filtered.length !== 1 ? "s" : ""} found
                </p>
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">School</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Students</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Teachers</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Classes</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((school) => {
                    const stats = schoolStats[school.id];
                    return (
                      <tr key={school.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-lg"
                              style={{ backgroundColor: school.themeColor ?? "#4F46E5" }}
                            >
                              {school.name[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 text-base">{school.name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">ID: {school.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-slate-100 text-slate-700">
                            {school.code}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold bg-emerald-50 text-emerald-700">
                              <GraduationCap className="w-4 h-4" />
                              {stats ? stats.studentCount : "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold bg-violet-50 text-violet-700">
                              <UserCheck className="w-4 h-4" />
                              {stats ? stats.teacherCount : "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold bg-indigo-50 text-indigo-700">
                              <LayoutGrid className="w-4 h-4" />
                              {stats ? stats.classCount : "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onViewSchool(school)}
                              title="View details"
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditSchool(school);
                                setEditForm({ name: school.name, themeColor: school.themeColor ?? "#4F46E5" });
                              }}
                              title="Edit"
                              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(school)}
                              title="Delete"
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <Modal title="Create New School" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <Section label="School Info">
              <Field label="School Name" required>
                <input
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Sunrise International School"
                  className={inputCls}
                />
              </Field>
              <Field label="School Code" required hint="Unique 3–10 char code used for login">
                <input
                  required
                  maxLength={10}
                  value={createForm.code}
                  onChange={(e) => setCreateForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. SCH001"
                  className={`${inputCls} font-mono`}
                />
              </Field>
              <Field label="Theme Color">
                <div className="flex items-center gap-2 flex-wrap">
                  {THEME_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCreateForm((f) => ({ ...f, themeColor: c }))}
                      className={`w-7 h-7 rounded-full transition ring-offset-2 ${
                        createForm.themeColor === c ? "ring-2 ring-slate-700" : ""
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={createForm.themeColor}
                    onChange={(e) => setCreateForm((f) => ({ ...f, themeColor: e.target.value }))}
                    className="w-7 h-7 rounded-full cursor-pointer border-0 bg-transparent p-0"
                    title="Custom color"
                  />
                </div>
              </Field>
            </Section>

            <Section label="Initial Admin Account">
              <Field label="Admin Name" required>
                <input
                  required
                  value={createForm.adminName}
                  onChange={(e) => setCreateForm((f) => ({ ...f, adminName: e.target.value }))}
                  placeholder="Full name"
                  className={inputCls}
                />
              </Field>
              <Field label="Admin Email" required>
                <input
                  required
                  type="email"
                  value={createForm.adminEmail}
                  onChange={(e) => setCreateForm((f) => ({ ...f, adminEmail: e.target.value }))}
                  placeholder="admin@school.com"
                  className={inputCls}
                />
              </Field>
              <Field label="Admin Password" required hint="Minimum 6 characters">
                <input
                  required
                  type="password"
                  value={createForm.adminPassword}
                  onChange={(e) => setCreateForm((f) => ({ ...f, adminPassword: e.target.value }))}
                  placeholder="••••••••"
                  className={inputCls}
                />
              </Field>
            </Section>

            {formError && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                {formError}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className={cancelCls}>
                Cancel
              </button>
              <button type="submit" disabled={saving} className={submitCls}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create School
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {editSchool && (
        <Modal title="Edit School" onClose={() => setEditSchool(null)}>
          <form onSubmit={handleEdit} className="space-y-4">
            <Field label="School Name" required>
              <input
                required
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <Field label="Theme Color">
              <div className="flex items-center gap-2 flex-wrap">
                {THEME_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setEditForm((f) => ({ ...f, themeColor: c }))}
                    className={`w-7 h-7 rounded-full transition ring-offset-2 ${
                      editForm.themeColor === c ? "ring-2 ring-slate-700" : ""
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <input
                  type="color"
                  value={editForm.themeColor}
                  onChange={(e) => setEditForm((f) => ({ ...f, themeColor: e.target.value }))}
                  className="w-7 h-7 rounded-full cursor-pointer border-0 bg-transparent p-0"
                />
              </div>
            </Field>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditSchool(null)} className={cancelCls}>
                Cancel
              </button>
              <button type="submit" disabled={saving} className={submitCls}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <Modal title="Delete School" onClose={() => setDeleteTarget(null)}>
          <p className="text-slate-600 text-sm mb-1">
            Are you sure you want to delete{" "}
            <strong className="text-slate-800">{deleteTarget.name}</strong>?
          </p>
          <p className="text-red-600 text-sm bg-red-50 rounded-xl px-4 py-2.5 mb-5">
            This will remove the school record. Student, user, and class data associated with this
            school will remain in Firestore but become orphaned.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteTarget(null)} className={cancelCls}>
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete School
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── helpers ── */

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">{label}</p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {hint && <span className="ml-2 text-slate-400 font-normal text-xs">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition";

const cancelCls =
  "flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-semibold text-sm transition";

const submitCls =
  "flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition shadow-lg shadow-indigo-500/25";
