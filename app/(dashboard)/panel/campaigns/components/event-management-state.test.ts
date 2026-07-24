import { describe, expect, it } from "vitest";
import { eventManagementPatch } from "./event-management-state";

describe("eventManagementPatch", () => {
  it("preserves the destination when only the optimization changes", () => {
    expect(
      eventManagementPatch({ optimizationGoal: "LANDING_PAGE_VIEWS" }),
    ).toEqual({
      optimizationGoal: "LANDING_PAGE_VIEWS",
      eventSourceIds: {},
    });
  });

  it("updates destination and optimization together", () => {
    expect(
      eventManagementPatch({
        destination: "WEBSITE",
        optimizationGoal: "LINK_CLICKS",
      }),
    ).toEqual({
      destination: "WEBSITE",
      optimizationGoal: "LINK_CLICKS",
      eventSourceIds: {},
    });
  });

  it("keeps conversion event sources until the user changes them", () => {
    expect(eventManagementPatch({ optimizationGoal: "CONVERSIONS" })).toEqual({
      optimizationGoal: "CONVERSIONS",
    });
    expect(eventManagementPatch({ eventSourceIds: { meta: "pixel-1" } })).toEqual({
      eventSourceIds: { meta: "pixel-1" },
    });
  });
});
