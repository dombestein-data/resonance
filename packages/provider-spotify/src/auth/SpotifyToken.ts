export interface SpotifyToken {
  accessToken: string;
  tokenType: string;
  scope: string;
  expiresAt: number;
  refreshToken?: string;
}

export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
}