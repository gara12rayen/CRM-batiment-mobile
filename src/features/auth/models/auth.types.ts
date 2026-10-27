
export type LoginCredentials = {
  email: string;
  password: string;
};

export type SessionUser = {
  id: string | number;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  companyId: string | number | null;
};

export type SessionResponse = {
  accessToken: string;
  user: SessionUser;
};

export type PasswordChangeRequiredResponse = {
  mustChangePassword: true;
  passwordChangeToken: string;
  message: string;
};

export type LoginResponse =
  | SessionResponse
  | PasswordChangeRequiredResponse;
