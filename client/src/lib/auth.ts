import { queryClient } from "./queryClient";

export interface User {
  id: number;
  username: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export function getAuthState(): AuthState {
  // This will be managed by React Query
  const userData = queryClient.getQueryData<{ user: User }>(["/api/auth/me"]);
  return {
    user: userData?.user || null,
    isAuthenticated: !!userData?.user,
  };
}
