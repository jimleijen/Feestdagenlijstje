import { api } from "./client";
import { GameSession, Hint, NameDraw } from "../types";

function drawsApiFor(basePath: "/lootjes" | "/secret-santa") {
  return {
    list: () => api.get<NameDraw[]>(basePath).then((r) => r.data),
    create: (data: { title: string; budget?: string; eventDate?: string }) =>
      api.post<NameDraw>(basePath, data).then((r) => r.data),
    get: (id: string) => api.get<NameDraw>(`${basePath}/${id}`).then((r) => r.data),
    addParticipant: (id: string, data: { name: string; email: string; excludeIds?: string[] }) =>
      api.post(`${basePath}/${id}/participants`, data).then((r) => r.data),
    removeParticipant: (id: string, participantId: string) =>
      api.delete(`${basePath}/${id}/participants/${participantId}`),
    run: (id: string) => api.post(`${basePath}/${id}/run`).then((r) => r.data),
    adminPeek: (id: string) =>
      api.get<{ assignments: { giver: string; receiver: string }[] }>(`${basePath}/${id}/admin-peek`).then((r) => r.data),
    myAssignment: (id: string) =>
      api.get<{ receiverName: string; receiverParticipantId: string }>(`${basePath}/${id}/my-assignment`).then((r) => r.data),
  };
}

export const lootjesApi = drawsApiFor("/lootjes");

export const secretSantaApi = {
  ...drawsApiFor("/secret-santa"),
  addHint: (id: string, text: string) => api.post<Hint>(`/secret-santa/${id}/hints`, { text }).then((r) => r.data),
  myHints: (id: string) => api.get<Hint[]>(`/secret-santa/${id}/hints/mine`).then((r) => r.data),
  deleteHint: (id: string, hintId: string) => api.delete(`/secret-santa/${id}/hints/${hintId}`),
  hintsToRead: (id: string) => api.get<Hint[]>(`/secret-santa/${id}/my-hints-to-read`).then((r) => r.data),
};

export const gameApi = {
  create: (title: string) => api.post<GameSession>("/game/sessions", { title }).then((r) => r.data),
  getByJoinCode: (joinCode: string) => api.get<GameSession>(`/game/sessions/join/${joinCode}`).then((r) => r.data),
  updateRule: (id: string, face: number, text: string) =>
    api.patch<{ face: number; text: string }>(`/game/sessions/${id}/rules/${face}`, { text }).then((r) => r.data),
};
