interface Participant {
  id: string;
  /** Other participant ids this person may NOT be assigned to (e.g. their partner). */
  excludeIds: string[];
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Assigns every participant exactly one other participant to give a gift to, such that
 * nobody draws themself or anyone on their exclude list. Full randomized backtracking
 * (not a fixed-shift rotation) so exclusions are respected and the result isn't guessable
 * from the participant order. Returns null only if the constraints make a valid draw
 * impossible (e.g. two participants who exclude everyone but each other).
 */
export function generateAssignments(participants: Participant[]): Record<string, string> | null {
  const exclusionSets = new Map<string, Set<string>>(
    participants.map((p) => [p.id, new Set([p.id, ...p.excludeIds])])
  );

  function backtrack(
    remainingGivers: string[],
    remainingReceivers: string[],
    assignment: Record<string, string>
  ): Record<string, string> | null {
    if (remainingGivers.length === 0) return assignment;

    const [giver, ...restGivers] = remainingGivers;
    const excluded = exclusionSets.get(giver)!;
    const candidates = shuffle(remainingReceivers.filter((r) => !excluded.has(r)));

    for (const candidate of candidates) {
      const result = backtrack(
        restGivers,
        remainingReceivers.filter((r) => r !== candidate),
        { ...assignment, [giver]: candidate }
      );
      if (result) return result;
    }
    return null;
  }

  const ids = participants.map((p) => p.id);
  return backtrack(shuffle(ids), ids, {});
}
