import session from 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
  export interface SessionOptions {
    secret: string;
    resave: boolean;
    saveUninitialized: boolean;
    cookie?: session.CookieOptions;
  }
}
