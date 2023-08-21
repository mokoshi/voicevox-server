declare namespace NodeJS {
  interface ProcessEnv {
    readonly OUTPUT_DIR: string;
    readonly AWS_ACCESS_KEY_ID: string;
    readonly AWS_SECRET_ACCESS_KEY: string;
  }
}
