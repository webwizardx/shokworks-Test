interface GlobalConfig {
  port: number;
  environment: string;
}

export default (): GlobalConfig => ({
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  environment: process.env.NODE_ENV || 'development',
});
