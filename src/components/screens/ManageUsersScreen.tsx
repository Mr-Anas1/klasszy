"use client";

import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft, Plus, Search, GraduationCap, Trash2, X, User, Mail, Users,
} from "lucide-react";
import { useApp, Student, UserProfile } from "@/context/AppContext";
import MobileSelect from "@/components/ui/MobileSelect";

type Tab = "students" | "teachers";

export default function ManageUsersScreen() {
  const {
    students, classes, usersList,
    setActiveTab, deleteStudent, deleteUser,
    showAlert, showConfirm, setSelectedStudent, setSelectedTeacher,
    addStudent, onboardUser,
  } = useApp();

  const [tab, setTab] = useState<Tab>("students");
  const [search, setSearch] = useState("");
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddTeacher, setShowAddTeacher] = useState(false);

  const [sData, setSData] = useState({
    name: "", classId: "", username: "", password: "",
  });
  const [tData, setTData] = useState({ name: "", email: "", password: "" });

  const portalTarget = useMemo(
    () => (typeof document !== "undefined" ? document.body : null),
    []
  );

  const teachers = usersList.filter(u => u.role === "teacher");
  const q = search.toLowerCase();
  const filteredStudents = students.filter(
    s => s.name.toLowerCase().includes(q)
  );
  const filteredTeachers = teachers.filter(
    t => t.name.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q)
  );

  const getClassName = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    return cls ? `${cls.name}-${cls.section}` : "Unassigned";
  };

  const handleDeleteStudent = (s: Student) => {
    showConfirm(
      "Delete Student?",
      `Remove ${s.name}? This will also delete the linked parent account.`,
      () => deleteStudent(s.id)
    );
  };

  const handleDeleteTeacher = (t: UserProfile) => {
    showConfirm(
      "Delete Teacher?",
      `Remove ${t.name}? Their account will be permanently deleted.`,
      () => deleteUser(t.id)
    );
  };

  const handleAddStudent = async () => {
    if (!sData.name || !sData.classId) {
      showAlert("Missing Info", "Name and class are required.", "error");
      return;
    }
    await addStudent({ name: sData.name, classId: sData.classId, username: sData.username, password: sData.password });
    setSData({ name: "", classId: "", username: "", password: "" });
    setShowAddStudent(false);
  };

  const handleAddTeacher = async () => {
    if (!tData.name || !tData.email) {
      showAlert("Missing Info", "Name and email are required.", "error");
      return;
    }
    try {
      await onboardUser(tData.name, tData.email, "teacher", tData.password || undefined, []);
      setTData({ name: "", email: "", password: "" });
      setShowAddTeacher(false);
    } catch (err: any) {
      showAlert("Error", err.message, "error");
    }
  };

  const switchTab = (t: Tab) => { setTab(t); setSearch(""); };

  return (
    <>
      <div className="pb-36 px-5 pt-6 animate-fade-slide-up">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-black text-gray-900 leading-none">Manage Users</h2>
            <p className="text-sm text-gray-400 font-medium mt-0.5">Students & Teachers</p>
          </div>
          <button
            onClick={() => tab === "students" ? setShowAddStudent(true) : setShowAddTeacher(true)}
            className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 active:scale-90 transition-transform"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-6 bg-gray-100 rounded-2xl p-1.5">
          {(["students", "teachers"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                tab === t ? "bg-white shadow text-gray-900" : "text-gray-400"
              }`}
            >
              {t === "students" ? `Students (${students.length})` : `Teachers (${teachers.length})`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            type="text"
            placeholder={`Search ${tab}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-3xl pl-11 pr-5 py-3.5 text-sm font-bold focus:outline-none focus:border-indigo-100 transition-all shadow-sm"
          />
        </div>

        {/* Student List */}
        {tab === "students" && (
          <div className="space-y-3">
            {filteredStudents.map(s => (
              <div
                key={s.id}
                className="bg-white rounded-[28px] p-5 border border-gray-100 shadow-sm flex items-center gap-4 group hover:border-indigo-100 transition-all"
              >
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                  <span className="text-sm font-black text-emerald-700 uppercase">{s.name[0]}</span>
                </div>
                <button
                  onClick={() => { setSelectedStudent(s); setActiveTab("student_detail"); }}
                  className="flex-1 text-left min-w-0"
                >
                  <h4 className="text-[15px] font-black text-gray-900 truncate">{s.name}</h4>
                  <p className="text-[11px] font-bold text-gray-400 mt-0.5">{getClassName(s.classId)}</p>
                </button>
                <button
                  onClick={() => handleDeleteStudent(s)}
                  className="w-9 h-9 bg-rose-50 text-rose-400 rounded-xl flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {filteredStudents.length === 0 && (
              <EmptyState Icon={GraduationCap} label="No students found" />
            )}
          </div>
        )}

        {/* Teacher List */}
        {tab === "teachers" && (
          <div className="space-y-3">
            {filteredTeachers.map(t => (
              <div
                key={t.id}
                className="bg-white rounded-[28px] p-5 border border-gray-100 shadow-sm flex items-center gap-4 group hover:border-indigo-100 transition-all"
              >
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
                  <span className="text-sm font-black text-indigo-700 uppercase">{t.name[0]}</span>
                </div>
                <button
                  onClick={() => { setSelectedTeacher(t); setActiveTab("teacher_detail"); }}
                  className="flex-1 text-left min-w-0"
                >
                  <h4 className="text-[15px] font-black text-gray-900 truncate">{t.name}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3 h-3 text-gray-300 shrink-0" />
                    <p className="text-[11px] font-bold text-gray-400 truncate">{t.email}</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Users className="w-3 h-3 text-indigo-400 shrink-0" />
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                      {t.classIds?.length || 0} classes assigned
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => handleDeleteTeacher(t)}
                  className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {filteredTeachers.length === 0 && (
              <EmptyState Icon={User} label="No teachers found" />
            )}
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddStudent && portalTarget && createPortal(
        <BottomSheet title="Add Student" onClose={() => setShowAddStudent(false)}>
          <div className="space-y-3">
            <Field placeholder="Full Name *" value={sData.name} onChange={v => setSData(p => ({ ...p, name: v }))} />
            <MobileSelect
              placeholder="Select class *"
              value={sData.classId}
              onChange={(v) => setSData((p) => ({ ...p, classId: v }))}
              options={classes.map((c) => ({
                value: c.id,
                label: `${c.name} · ${c.section}`,
              }))}
              searchable
            />
            <Field placeholder="Username (for student login)" value={sData.username} onChange={v => setSData(p => ({ ...p, username: v }))} />
            <Field placeholder="Password (optional)" type="password" value={sData.password} onChange={v => setSData(p => ({ ...p, password: v }))} />
          </div>
          <SubmitButton label="Add Student" onClick={handleAddStudent} />
        </BottomSheet>,
        portalTarget
      )}

      {/* Add Teacher Modal */}
      {showAddTeacher && portalTarget && createPortal(
        <BottomSheet title="Add Teacher" onClose={() => setShowAddTeacher(false)}>
          <div className="space-y-3">
            <Field placeholder="Full Name *" value={tData.name} onChange={v => setTData(p => ({ ...p, name: v }))} />
            <Field placeholder="Email Address *" type="email" value={tData.email} onChange={v => setTData(p => ({ ...p, email: v }))} />
            <Field placeholder="Password (default: password123)" type="password" value={tData.password} onChange={v => setTData(p => ({ ...p, password: v }))} />
          </div>
          <SubmitButton label="Add Teacher" onClick={handleAddTeacher} />
        </BottomSheet>,
        portalTarget
      )}
    </>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function EmptyState({ Icon, label }: { Icon: React.ElementType; label: string }) {
  return (
    <div className="bg-white border border-dashed border-gray-200 rounded-[32px] p-16 text-center">
      <Icon className="w-10 h-10 text-gray-200 mx-auto mb-3" />
      <p className="font-black text-gray-900">{label}</p>
    </div>
  );
}

function BottomSheet({
  title, children, onClose,
}: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-end">
      <div className="bg-white w-full rounded-t-[40px] p-8 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-gray-900">{title}</h3>
          <button onClick={onClose} className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({
  placeholder, value, onChange, type = "text",
}: { placeholder: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
    />
  );
}

function SubmitButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full mt-5 bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
    >
      {label}
    </button>
  );
}
