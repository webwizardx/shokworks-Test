export interface GlobalConfig {
  port: number;
  environment: string;
  jwt: {
    salt: number;
    secret: string;
  };
}

export default (): GlobalConfig => ({
  environment: process.env.NODE_ENV || 'development',
  jwt: {
    salt: process.env.JWT_SALT ? parseInt(process.env.JWT_SALT) : 10,
    secret: process.env.JWT_SECRET as string,
  },
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
});
