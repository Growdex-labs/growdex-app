import { track } from "@/lib/analytics";
import {
  adviceActionKey,
  applyCampaignOptimizations,
  type CampaignAdviceAction,
} from "@/lib/campaigns";
import type {
  AdviceActionState,
  AiMessage,
} from "../campaigns/components/AiSidePanel";

export const withAdviceActionState = (
  messages: AiMessage[],
  messageId: string,
  action: CampaignAdviceAction,
  state: AdviceActionState,
): AiMessage[] =>
  messages.map((message) =>
    message.id === messageId
      ? {
          ...message,
          actionState: {
            ...message.actionState,
            [adviceActionKey(action)]: state,
          },
        }
      : message,
  );

export const takeAdviceAction = async (
  action: CampaignAdviceAction,
): Promise<"opened" | "applied"> => {
  if (action.type === "open") return "opened";
  await applyCampaignOptimizations({
    campaignId: action.campaignId,
    revision: action.revision,
    proposalIds: [action.proposalId],
    idempotencyKey: crypto.randomUUID(),
  });
  track("ai_optimization_applied");
  return "applied";
};
