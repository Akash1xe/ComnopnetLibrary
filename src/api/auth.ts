import axios from "axios";
import { apiClient } from "../lib/axios";
import type { AuthResponse, AuthUserMessage, User } from "../types";

export function register(data: {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}): Promise<AuthUserMessage> {
  return apiClient.post("/auth/register", data).then((response) => response.data);
}

export function login(data: { email: string; password: string }): Promise<AuthResponse> {
  const formData = new URLSearchParams();
  formData.set("username", data.email);
  formData.set("password", data.password);

  return apiClient
    .post("/auth/login", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
    .then((response) => response.data);
}

export function logout(refreshToken?: string): Promise<{ message: string }> {
  return apiClient.post("/auth/logout", refreshToken ? { refresh_token: refreshToken } : undefined).then((response) => response.data);
}

export function refreshToken(refresh_token: string): Promise<AuthResponse> {
  return apiClient.post("/auth/refresh", { refresh_token }).then((response) => response.data);
}

export function getMe(): Promise<User> {
  return apiClient.get("/auth/me").then((response) => response.data);
}

export function verifyEmail(token: string): Promise<AuthResponse> {
  return apiClient.get("/auth/verify-email", { params: { token } }).then((response) => response.data);
}

export function forgotPassword(email: string): Promise<{ message: string }> {
  return apiClient.post("/auth/forgot-password", { email }).then((response) => response.data);
}

export function resetPassword(token: string, new_password: string): Promise<{ message: string }> {
  return apiClient.post("/auth/reset-password", { token, new_password }).then((response) => response.data);
}

export function getGithubAuthUrl(): Promise<{ auth_url: string }> {
  return apiClient.get("/auth/github/authorize").then((response) => ({
    auth_url: response.data.authorize_url,
  }));
}

export function githubCallback(code: string, state: string): Promise<AuthResponse & { is_new_user: boolean }> {
  return apiClient
    .get("/auth/github/callback", { params: { code, state } })
    .then((response) => ({ ...response.data, is_new_user: response.data.is_new_user }));
}

export function isAxiosError(error: unknown) {
  return axios.isAxiosError(error);
}
