export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Wensenlijstjes: undefined;
  Lootjes: undefined;
  "Secret Santa": undefined;
  Spel: undefined;
};

export type WishlistStackParamList = {
  WishlistList: undefined;
  WishlistDetail: { wishlistId?: string; shareCode?: string };
  WishlistEdit: { wishlistId?: string };
  WishlistViewShared: undefined;
};

export type LootjesStackParamList = {
  LootjesList: undefined;
  LootjesCreate: undefined;
  LootjesDetail: { drawId: string };
  LootjesJoin: undefined;
};

export type SecretSantaStackParamList = {
  SecretSantaList: undefined;
  SecretSantaCreate: undefined;
  SecretSantaDetail: { drawId: string };
  SecretSantaHints: { drawId: string };
  SecretSantaJoin: undefined;
};

export type DobbelspelStackParamList = {
  DobbelspelHome: undefined;
  DobbelspelSession: { joinCode: string };
};
