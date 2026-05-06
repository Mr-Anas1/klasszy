"use client";

import { useState, useEffect } from "react";
import { Loader2, Sparkles, Check } from "lucide-react";
import { useSuperAdmin } from "@/context/SuperAdminContext";
import { School } from "@/context/AppContext";
import {
  FEATURE_REGISTRY,
  FEATURE_CATEGORIES,
  FeatureCategory,
  getFeaturesByCategory,
} from "@/lib/feature-registry";

interface Props {
  school: School;
}

export default function SAFeatureManager({ school }: Props) {
  const { updateSchoolFeatures, showAlert } = useSuperAdmin();
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  // Initialise local state from school doc (fall back to registry defaults)
  useEffect(() => {
    const initial: Record<string, boolean> = {};
    for (const f of FEATURE_REGISTRY) {
      initial[f.id] = school.features?.[f.id] ?? f.defaultEnabled;
    }
    setFeatures(initial);
  }, [school.id, school.features]);

  const handleToggle = async (featureId: string) => {
    const prev = { ...features };
    const updated = { ...features, [featureId]: !features[featureId] };
    setFeatures(updated);
    setSaving(featureId);

    try {
      await updateSchoolFeatures(school.id, updated);
      setSaved(featureId);
      setTimeout(() => setSaved(null), 1200);
    } catch {
      setFeatures(prev); // revert
      showAlert("Error", "Failed to update feature.", "error");
    } finally {
      setSaving(null);
    }
  };

  const grouped = getFeaturesByCategory();

  const enabledCount = Object.values(features).filter(Boolean).length;
  const totalCount = FEATURE_REGISTRY.length;

  return (
    <div className="p-5 lg:p-6 space-y-8">
      {/* Summary bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-700">{enabledCount}</span> of{" "}
          {totalCount} features enabled
        </p>
        <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${(enabledCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Category groups */}
      {(Object.keys(FEATURE_CATEGORIES) as FeatureCategory[]).map((catId) => {
        const catFeatures = grouped[catId];
        if (catFeatures.length === 0) return null;
        const cat = FEATURE_CATEGORIES[catId];

        return (
          <div key={catId}>
            {/* Category header */}
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <h3 className="text-sm font-semibold text-slate-700">
                {cat.label}
              </h3>
              <span className="text-xs text-slate-400">
                — {cat.description}
              </span>
            </div>

            {/* Feature cards */}
            <div className="grid gap-2.5">
              {catFeatures.map((feature) => {
                const on = features[feature.id] ?? false;
                const isSaving = saving === feature.id;
                const justSaved = saved === feature.id;

                return (
                  <div
                    key={feature.id}
                    className={`flex items-center gap-4 px-5 py-4 rounded-xl border transition-all duration-200 ${
                      on
                        ? "bg-white border-slate-200 shadow-sm"
                        : "bg-slate-50/70 border-slate-100"
                    }`}
                  >
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p
                          className={`font-semibold text-sm transition-colors ${
                            on ? "text-slate-800" : "text-slate-400"
                          }`}
                        >
                          {feature.name}
                        </p>
                        {feature.tier === "premium" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-200/60">
                            <Sparkles className="w-2.5 h-2.5" />
                            Premium
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                            Basic
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs mt-0.5 transition-colors ${
                          on ? "text-slate-400" : "text-slate-300"
                        }`}
                      >
                        {feature.description}
                      </p>
                    </div>

                    {/* Status indicator */}
                    {justSaved && (
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 animate-in zoom-in" />
                    )}
                    {isSaving && (
                      <Loader2 className="w-4 h-4 text-slate-400 animate-spin shrink-0" />
                    )}

                    {/* Toggle switch */}
                    <button
                      onClick={() => handleToggle(feature.id)}
                      disabled={isSaving}
                      aria-label={`Toggle ${feature.name}`}
                      className={`relative w-12 h-7 rounded-full transition-colors duration-200 shrink-0 ${
                        on ? "bg-indigo-600" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                          on ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
