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

export type ChangePasswordCredentials = {
  currentPassword: string;
  newPassword: string;
};

export type ChangePasswordResponse = SessionResponse & {
  message: string;
};

export function isPasswordChangeRequired(
  response: LoginResponse,
): response is PasswordChangeRequiredResponse {
  return "mustChangePassword" in response;
}

export const PASSWORD_POLICY = {
  minLength: 10,
  maxLength: 72,
  description:
    "Au moins 10 caractères, dont une majuscule, une minuscule et un chiffre.",
} as const;