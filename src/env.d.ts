declare namespace NodeJS {
  interface ProcessEnv {
    SESSION_SECRET: string;
    DOMAIN: string;
    CORS_ORIGIN: string;
    DATABASE_URL: string;
    REDIS_URL: string;
    PORT: string;
    TEST_EMAIL: string;
    TEST_EMAIL_PASS: string;
  }
}