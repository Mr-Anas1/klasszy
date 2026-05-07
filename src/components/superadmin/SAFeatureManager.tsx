"use client";

import { useState, useEffect } from "react";
import { Loader2, Sparkles, Check, Settings, Info } from "lucide-react";
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            Feature Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Configure which features are available for {school.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-700">
              {enabledCount} of {totalCount} enabled
            </p>
            <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${(enabledCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category groups */}
      <div className="space-y-8">
        {(Object.keys(FEATURE_CATEGORIES) as FeatureCategory[]).map((catId) => {
          const catFeatures = grouped[catId];
          if (catFeatures.length === 0) return null;
          const cat = FEATURE_CATEGORIES[catId];

          return (
            <div key={catId} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {/* Category header */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-slate-900">
                      {cat.label}
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {cat.description}
                    </p>
                  </div>
                  <div className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                    {catFeatures.length} feature{catFeatures.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              {/* Feature list */}
              <div className="divide-y divide-slate-100">

                {catFeatures.map((feature) => {
                  const on = features[feature.id] ?? false;
                  const isSaving = saving === feature.id;
                  const justSaved = saved === feature.id;

                  return (
                    <div
                      key={feature.id}
                      className={`px-6 py-4 transition-all duration-200 ${
                        on ? "bg-white" : "bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Feature Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {feature.tier === "premium" ? (
                                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                                  <Sparkles className="w-4 h-4 text-amber-600" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                  <Settings className="w-4 h-4 text-slate-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4
                                  className={`font-semibold text-base transition-colors ${
                                    on ? "text-slate-900" : "text-slate-500"
                                  }`}
                                >
                                  {feature.name}
                                </h4>
                                {feature.tier === "premium" ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                                    Premium
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                    Basic
                                  </span>
                                )}
                              </div>
                              <p
                                className={`text-sm mt-1 transition-colors ${
                                  on ? "text-slate-600" : "text-slate-400"
                                }`}
                              >
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Status & Toggle */}
                        <div className="flex items-center gap-3">
                          {/* Status indicator */}
                          {justSaved && (
                            <div className="flex items-center gap-1 text-emerald-600">
                              <Check className="w-4 h-4" />
                              <span className="text-xs font-medium">Saved</span>
                            </div>
                          )}
                          {isSaving && (
                            <div className="flex items-center gap-1 text-slate-500">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-xs font-medium">Saving</span>
                            </div>
                          )}

                          {/* Toggle switch */}
                          <button
                            onClick={() => handleToggle(feature.id)}
                            disabled={isSaving}
                            aria-label={`Toggle ${feature.name}`}
                            type="button"
                            className={`relative w-14 h-8 rounded-full transition-colors duration-200 shrink-0 ${
                              on ? "bg-indigo-600 hover:bg-indigo-700" : "bg-slate-300 hover:bg-slate-400"
                            } ${isSaving ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                          >
                            <span
                              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-200 pointer-events-none ${
                                on ? "translate-x-6" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info footer */}
      <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <Info className="w-5 h-5 text-slate-400 mt-0.5" />
        <div className="text-sm text-slate-600">
          <p className="font-medium mb-1">About Feature Management</p>
          <p className="text-slate-500">
            Enable or disable features for this school. Disabled features will be hidden from all users in this school.
            Basic features are included in all plans, while Premium features may require additional licensing.
          </p>
        </div>
      </div>
    </div>
  );
}
