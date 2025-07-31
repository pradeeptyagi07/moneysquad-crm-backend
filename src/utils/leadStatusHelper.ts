// central allowed transitions (lowercase keys)
export const allowedStatusTransitions: Record<string, string[]> = {
  pending: ["login", "closed"],
  login: ["approved", "rejected", "closed"],
  approved: ["disbursed", "closed", "rejected"],
  disbursed: ["closed"],
  rejected: ["approved", "closed"],
  closed: [],
  expired: ["login"],
};

export class TransitionError extends Error {
  code: "SAME_STATUS" | "INVALID_TRANSITION";
  constructor(message: string, code: "SAME_STATUS" | "INVALID_TRANSITION") {
    super(message);
    this.name = "TransitionError";
    this.code = code;
  }
}

export function validateTransition(current: string, requested: string) {
  const curr = (current || "").toLowerCase();
  const req = (requested || "").toLowerCase();

  if (curr === req) {
    throw new TransitionError(
      `Status is already '${requested}'. No change was made, refresh to view current status.`,
      "SAME_STATUS"
    );
  }

  const allowed = allowedStatusTransitions[curr] || [];
  if (!allowed.includes(req)) {
    throw new TransitionError(
      `Invalid transition from '${current}' to '${requested}'.`,
      "INVALID_TRANSITION"
    );
  }
}
