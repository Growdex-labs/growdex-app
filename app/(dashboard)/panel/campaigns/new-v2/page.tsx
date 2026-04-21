"use client";

import React, { useState, useEffect } from "react";
// Change this import to wherever your apiFetch is located!
import { apiFetch } from "@/lib/auth";
import "./components/CampaignCreate.css";

export default function CreateCampaignPage() {
  const [formData, setFormData] = useState({
    name: "",
    goal: "AWARENESS",
    platforms: ["meta"],
    targeting: {
      locations: ["US"],
      ageMin: 18,
      ageMax: 65,
      gender: "all",
      interests: [] as string[],
    },
    budget: {
      amount: 100,
      currency: "USD",
      type: "daily",
      startDate: new Date().toISOString().slice(0, 16),
      endDate: "",
    },
    creatives: [
      {
        primaryText: "",
        headline: "",
        cta: "LEARN_MORE",
        mediaUrl: "",
      },
    ],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Meta Interests Auto-complete state
  const [interestQuery, setInterestQuery] = useState("");
  const [interestResults, setInterestResults] = useState<
    { id: string; name: string }[]
  >([]);
  const [selectedInterests, setSelectedInterests] = useState<
    { id: string; name: string }[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce Meta API interest search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (interestQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const res = await apiFetch(
            `/campaigns/meta-interests/search?q=${encodeURIComponent(
              interestQuery
            )}`
          );
          const json = await res.json();
          if (json.success && json.data) {
            setInterestResults(json.data);
          }
        } catch (e) {
          console.error("Failed to search interests", e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setInterestResults([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [interestQuery]);

  const handleAddInterest = (interest: { id: string; name: string }) => {
    if (!selectedInterests.find((i) => i.id === interest.id)) {
      const newInterests = [...selectedInterests, interest];
      setSelectedInterests(newInterests);
      setFormData((prev) => ({
        ...prev,
        targeting: {
          ...prev.targeting,
          interests: newInterests.map((i) => i.id),
        },
      }));
    }
    setInterestQuery("");
    setInterestResults([]);
  };

  const handleRemoveInterest = (id: string) => {
    const newInterests = selectedInterests.filter((i) => i.id !== id);
    setSelectedInterests(newInterests);
    setFormData((prev) => ({
      ...prev,
      targeting: {
        ...prev.targeting,
        interests: newInterests.map((i) => i.id),
      },
    }));
  };

  const handlePlatformToggle = (platform: string) => {
    setFormData((prev) => {
      const exists = prev.platforms.includes(platform);
      const newPlatforms = exists
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform];
      return { ...prev, platforms: newPlatforms };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Create a shallow copy structure where we need to modify nested fields
      const payload = {
        ...formData,
        budget: { ...formData.budget },
      };

      // Convert datetime-local string to ISO 8601
      if (payload.budget.startDate) {
        payload.budget.startDate = new Date(
          payload.budget.startDate
        ).toISOString();
      }

      // Clean up empty optional fields
      if (!payload.budget.endDate) {
        delete (payload.budget as any).endDate;
      } else {
        payload.budget.endDate = new Date(payload.budget.endDate).toISOString();
      }

      // Send formatting to match the new API schema
      const res = await apiFetch("/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to create campaign");
      }

      setSuccess(true);
      // Automatically publish after creation for a seamless flow,
      // or redirect to dashboard
      await apiFetch(`/campaigns/${json.id}/publish`, { method: "POST" });

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-y-auto">
      <div className="campaign-container">
        <div className="campaign-header">
          <h1 className="title-gradient">Launch Campaign</h1>
          <p className="subtitle">Deploy your multi-platform ad campaign instantly.</p>
        </div>

      {error && <div className="alert error-alert">{error}</div>}
      {success && (
        <div className="alert success-alert">
          Campaign created and publishing started successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="campaign-form">
        <div className="form-grid">
          {/* LEFT COLUMN */}
          <div className="form-column">
            <div className="glass-panel">
              <h3>General Details</h3>
              <div className="input-group">
                <label>Campaign Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer Sale 2026"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="input-group">
                <label>Objective</label>
                <select
                  value={formData.goal}
                  onChange={(e) =>
                    setFormData({ ...formData, goal: e.target.value })
                  }
                >
                  <option value="AWARENESS">Awareness</option>
                  <option value="TRAFFIC">Traffic</option>
                  <option value="ENGAGEMENT">Engagement</option>
                  <option value="LEADS">Leads</option>
                  <option value="APP_PROMOTION">App Promotion</option>
                  <option value="SALES">Sales</option>
                </select>
              </div>

              <div className="input-group">
                <label>Platforms</label>
                <div className="platform-toggles">
                  <button
                    type="button"
                    className={`platform-btn ${
                      formData.platforms.includes("meta") ? "active meta" : ""
                    }`}
                    onClick={() => handlePlatformToggle("meta")}
                  >
                    Meta Ads
                  </button>
                  <button
                    type="button"
                    className={`platform-btn ${
                      formData.platforms.includes("tiktok") ? "active tiktok" : ""
                    }`}
                    onClick={() => handlePlatformToggle("tiktok")}
                  >
                    TikTok Ads
                  </button>
                </div>
              </div>
            </div>

            <div className="glass-panel">
              <h3>Budget & Schedule</h3>
              <div className="row-group">
                <div className="input-group">
                  <label>Type</label>
                  <select
                    value={formData.budget.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        budget: { ...formData.budget, type: e.target.value },
                      })
                    }
                  >
                    <option value="daily">Daily</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Amount (NGN)</label>
                  <input
                    type="number"
                    min="1000"
                    required
                    value={formData.budget.amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        budget: {
                          ...formData.budget,
                          amount: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div className="row-group">
                <div className="input-group">
                  <label>Start Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.budget.startDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        budget: {
                          ...formData.budget,
                          startDate: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="input-group">
                  <label>End Date (Optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.budget.endDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        budget: { ...formData.budget, endDate: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="form-column">
            <div className="glass-panel targeting-panel">
              <h3>Audience Targeting</h3>
              <div className="row-group">
                <div className="input-group">
                  <label>Min Age</label>
                  <input
                    type="number"
                    min="18"
                    max="65"
                    value={formData.targeting.ageMin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targeting: {
                          ...formData.targeting,
                          ageMin: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="input-group">
                  <label>Max Age</label>
                  <input
                    type="number"
                    min="18"
                    max="65"
                    value={formData.targeting.ageMax}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targeting: {
                          ...formData.targeting,
                          ageMax: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="input-group">
                  <label>Gender</label>
                  <select
                    value={formData.targeting.gender}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targeting: {
                          ...formData.targeting,
                          gender: e.target.value,
                        },
                      })
                    }
                  >
                    <option value="all">All</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="input-group autocomplete-group">
                <label>Meta Detailed Targeting (Interests)</label>
                <div className="interest-search-wrapper">
                  <input
                    type="text"
                    placeholder="Search interests (e.g., Football, Technology)..."
                    value={interestQuery}
                    onChange={(e) => setInterestQuery(e.target.value)}
                  />
                  {isSearching && <span className="searching-spinner"></span>}
                </div>

                {interestResults.length > 0 && (
                  <ul className="autocomplete-dropdown">
                    {interestResults.map((result) => (
                      <li
                        key={result.id}
                        onClick={() => handleAddInterest(result)}
                      >
                        {result.name}
                        <span className="interest-id">ID: {result.id}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {selectedInterests.length > 0 && (
                  <div className="selected-interests">
                    {selectedInterests.map((interest) => (
                      <div key={interest.id} className="interest-pill">
                        {interest.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveInterest(interest.id)}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="glass-panel">
              <h3>Ad Creative</h3>
              <div className="input-group">
                <label>Media URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/image.jpg"
                  value={formData.creatives[0].mediaUrl}
                  onChange={(e) => {
                    const newCreatives = [...formData.creatives];
                    newCreatives[0].mediaUrl = e.target.value;
                    setFormData({ ...formData, creatives: newCreatives });
                  }}
                />
              </div>

              <div className="input-group">
                <label>Primary Text</label>
                <textarea
                  required
                  placeholder="Tell people what your ad is about..."
                  value={formData.creatives[0].primaryText}
                  onChange={(e) => {
                    const newCreatives = [...formData.creatives];
                    newCreatives[0].primaryText = e.target.value;
                    setFormData({ ...formData, creatives: newCreatives });
                  }}
                  rows={3}
                />
              </div>

              <div className="row-group">
                <div className="input-group">
                  <label>Headline</label>
                  <input
                    type="text"
                    placeholder="Catchy headline"
                    value={formData.creatives[0].headline}
                    onChange={(e) => {
                      const newCreatives = [...formData.creatives];
                      newCreatives[0].headline = e.target.value;
                      setFormData({ ...formData, creatives: newCreatives });
                    }}
                  />
                </div>
                <div className="input-group">
                  <label>Call to Action</label>
                  <select
                    value={formData.creatives[0].cta}
                    onChange={(e) => {
                      const newCreatives = [...formData.creatives];
                      newCreatives[0].cta = e.target.value;
                      setFormData({ ...formData, creatives: newCreatives });
                    }}
                  >
                    <option value="LEARN_MORE">Learn More</option>
                    <option value="SHOP_NOW">Shop Now</option>
                    <option value="SIGN_UP">Sign Up</option>
                    <option value="DOWNLOAD">Download</option>
                    <option value="BOOK_NOW">Book Now</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-footer">
          <button
            type="submit"
            className="submit-glow-btn"
            disabled={isLoading || formData.platforms.length === 0}
          >
            {isLoading ? "LAUNCHING..." : "LAUNCH CAMPAIGN"}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
