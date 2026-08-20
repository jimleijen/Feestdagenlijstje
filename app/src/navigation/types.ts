export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type WishlistStackParamList = {
  WishlistList: undefined;
  WishlistDetail: { wishlistId: string };
  WishlistEdit: { wishlistId?: string };
};

export type LootjesStackParamList = {
  LootjesList: undefined;
  LootjesCreate: undefined;
  LootjesDetail: { drawId: string };
};

export type SecretSantaStackParamList = {
  SecretSantaList: undefined;
  SecretSantaCreate: undefined;
  SecretSantaDetail: { drawId: string };
  SecretSantaHints: { drawId: string };
};

export type DobbelspelStackParamList = {
  DobbelspelHome: undefined;
  DobbelspelSession: { joinCode: string };
};
