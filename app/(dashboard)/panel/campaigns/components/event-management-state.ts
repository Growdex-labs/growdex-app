import type {
  AudienceStrategyConfiguration,
  CampaignConfiguration,
} from "@/lib/campaigns";

type EventManagementConfiguration = CampaignConfiguration &
  AudienceStrategyConfiguration;

export function eventManagementPatch(
  next: Partial<EventManagementConfiguration>,
): Partial<AudienceStrategyConfiguration> {
  const patch: Partial<AudienceStrategyConfiguration> = {};

  if (next.destination !== undefined) {
    patch.destination = next.destination;
  }
  if (next.optimizationGoal !== undefined) {
    patch.optimizationGoal = next.optimizationGoal;
    if (next.optimizationGoal !== "CONVERSIONS") {
      patch.eventSourceIds = {};
      patch.optimizationEvents = {};
    }
  }
  if (next.eventSourceIds !== undefined) {
    patch.eventSourceIds = next.eventSourceIds;
  }
  if (next.optimizationEvents !== undefined) patch.optimizationEvents = next.optimizationEvents;

  return patch;
}
