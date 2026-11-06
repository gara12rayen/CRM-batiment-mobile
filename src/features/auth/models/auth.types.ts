
export const USER_ROLES = [
  "ADMIN",
  "TECHNICO",
  "ASSISTANTE",
  "CHEF_CHANTIER",
  "SOUS_TRAITANT",
  "FOURNISSEUR",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function isUserRole(value: unknown): value is UserRole {
  return (
    typeof value === "string" &&
    USER_ROLES.includes(value as UserRole)
  );
}

export type LoginCredentials = {
  email: string;
  password: string;
};

export type SessionUser = {
  id: string | number;
  email: string;
  nom: string;
  prenom: string;
  role: UserRole;
  companyId: string | number | null;
  /** Present in GET /auth/me; absent from the login SessionResponse. */
  company?: { id: number; nom: string };
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
