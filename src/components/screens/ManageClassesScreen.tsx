"use client";

import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Plus, School, Trash2, X } from "lucide-react";
import { useApp, STANDARD_GRADES } from "@/context/AppContext";

type View = "grades" | "sections";

export default function ManageClassesScreen() {
  const {
    classes, students, addClass, deleteClass,
    setActiveTab, showConfirm, showAlert,
  } = useApp();

  const [view, setView] = useState<View>("grades");
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [showAddClass, setShowAddClass] = useState(false);
  const [cData, setCData] = useState({
    grade: STANDARD_GRADES[0],
    section: "A",
    customSection: "",
  });

  const portalTarget = useMemo(
    () => (typeof document !== "undefined" ? document.body : null),
    []
  );

  // Group classes by grade name
  const gradesMap: Record<string, typeof classes> = {};
  classes.forEach(c => {
    if (!gradesMap[c.name]) gradesMap[c.name] = [];
    gradesMap[c.name].push(c);
  });
  const uniqueGrades = Object.keys(gradesMap).sort((a, b) => {
    const ai = STANDARD_GRADES.indexOf(a);
    const bi = STANDARD_GRADES.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const handleAddClass = async () => {
    const finalSection = cData.section === "custom" ? cData.customSection.trim() : cData.section;
    if (!cData.grade || !finalSection) {
      showAlert("Missing Info", "Grade and section are required.", "error");
      return;
    }
    await addClass({ name: cData.grade, section: finalSection });
    setCData({ grade: STANDARD_GRADES[0], section: "A", customSection: "" });
    setShowAddClass(false);
  };

  const handleDeleteClass = (classId: string) => {
    showConfirm(
      "Delete Section?",
      "This will remove the section. Students will become unassigned.",
      () => deleteClass(classId)
    );
  };

  // ── Sections View ──────────────────────────────────────────────────────────
  if (view === "sections" && selectedGrade) {
    const sections = gradesMap[selectedGrade] || [];
    return (
      <>
        <div className="pb-36 px-5 pt-6 animate-fade-slide-up">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setView("grades")}
              className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm active:scale-90 transition-transform"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex-1">
              <h2 className="text-2xl font-black text-gray-900">{selectedGrade} Class</h2>
              <p className="text-sm text-gray-400 mt-0.5">Sections · {sections.length} total</p>
            </div>
            <button
              onClick={() => { setCData(p => ({ ...p, grade: selectedGrade })); setShowAddClass(true); }}
              className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 active:scale-90 transition-transform"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            {sections.map(s => {
              const count = students.filter(st => st.classId === s.id).length;
              return (
                <div key={s.id} className="flex gap-2 group">
                  <div className="flex-1 bg-white rounded-[28px] p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center font-black text-emerald-600 text-lg">
                        {s.section}
                      </div>
                      <div>
                        <p className="font-black text-gray-900">Section {s.section}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">
                          {count} student{count !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteClass(s.id)}
                    className="w-14 bg-white border border-gray-100 rounded-[28px] flex items-center justify-center text-gray-300 hover:text-rose-500 hover:border-rose-100 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}

            {sections.length === 0 && (
              <div className="bg-white border border-dashed border-gray-200 rounded-[32px] p-12 text-center">
                <School className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="font-black text-gray-900">No sections yet</p>
                <p className="text-sm text-gray-400 mt-1">Tap + to add the first section</p>
              </div>
            )}
          </div>
        </div>

        {showAddClass && portalTarget && createPortal(
          <AddClassModal
            cData={cData}
            setCData={setCData}
            onClose={() => setShowAddClass(false)}
            onAdd={handleAddClass}
          />,
          portalTarget
        )}
      </>
    );
  }

  // ── Grades View ────────────────────────────────────────────────────────────
  return (
    <>
      <div className="pb-36 px-5 pt-6 animate-fade-slide-up">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab("home")}
            className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-gray-900">Classes</h2>
            <p className="text-sm text-gray-400 mt-0.5">Grade & Section Management</p>
          </div>
          <button
            onClick={() => setShowAddClass(true)}
            className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 active:scale-90 transition-transform"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {uniqueGrades.map(gName => (
            <button
              key={gName}
              onClick={() => { setSelectedGrade(gName); setView("sections"); }}
              className="bg-white rounded-[32px] p-6 border border-gray-100 text-left hover:border-indigo-100 active:scale-95 transition-all shadow-sm group"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                <School className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-black text-gray-900">{gName}</h4>
              <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-widest">
                {gradesMap[gName].length} section{gradesMap[gName].length !== 1 ? "s" : ""}
              </p>
            </button>
          ))}

          {uniqueGrades.length === 0 && (
            <div className="col-span-2 bg-white border border-dashed border-gray-200 rounded-[32px] p-16 text-center">
              <School className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="font-black text-gray-900">No classes created yet</p>
              <p className="text-sm text-gray-400 mt-1">Tap + to create your first class</p>
            </div>
          )}
        </div>
      </div>

      {showAddClass && portalTarget && createPortal(
        <AddClassModal
          cData={cData}
          setCData={setCData}
          onClose={() => setShowAddClass(false)}
          onAdd={handleAddClass}
        />,
        portalTarget
      )}
    </>
  );
}

// ─── Add Class Modal ──────────────────────────────────────────────────────────

type CData = { grade: string; section: string; customSection: string };

function AddClassModal({
  cData, setCData, onClose, onAdd,
}: {
  cData: CData;
  setCData: React.Dispatch<React.SetStateAction<CData>>;
  onClose: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-end">
      <div className="bg-white w-full rounded-t-[40px] p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-gray-900">Add Class</h3>
          <button onClick={onClose} className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Grade</p>
            <select
              value={cData.grade}
              onChange={e => setCData(p => ({ ...p, grade: e.target.value }))}
              className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              {STANDARD_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Section</p>
            <div className="flex gap-2 flex-wrap">
              {["A", "B", "C", "D", "custom"].map(s => (
                <button
                  key={s}
                  onClick={() => setCData(p => ({ ...p, section: s }))}
                  className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                    cData.section === s ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {s === "custom" ? "Custom" : s}
                </button>
              ))}
            </div>
          </div>

          {cData.section === "custom" && (
            <input
              type="text"
              placeholder="Enter section name"
              value={cData.customSection}
              onChange={e => setCData(p => ({ ...p, customSection: e.target.value }))}
              className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          )}
        </div>

        <button
          onClick={onAdd}
          className="w-full mt-6 bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
        >
          Create Class
        </button>
      </div>
    </div>
  );
}
