export type AccountProfile = {
  age: number | null;
  bio: string;
  city: string;
  club: string;
  interestTags: string[];
  name: string;
  sport: string;
  position: string;
  username: string;
};

export type PublicProfileDocument = {
  age: number | null;
  bio: string;
  city: string;
  club: string;
  interestTags: string[];
  name: string;
  photoURL: string;
  identityVerified: boolean;
  plusActive: boolean;
  sport: string;
  position: string;
  profileCompleted: true;
  uid: string;
  username: string;
};

export type SocialUser = AccountProfile & {
  id: string;
  role: "Usuário";
  photoURL?: string;
  identityVerified?: boolean;
  plusActive?: boolean;
  profileCompleted: true;
};
