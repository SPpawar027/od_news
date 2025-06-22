import "express-session";

declare module "express-session" {
  interface SessionData {
    adminId?: number;
    adminUser?: {
      id: number;
      username: string;
      email: string;
      role: string;
    };
  }
}