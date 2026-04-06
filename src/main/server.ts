import { envProvider } from '@/infra/config/ProcessEnvProvider.js';
import { validateEnvOrThrow } from '@/infra/config/env.dto';
import { app } from './app';

validateEnvOrThrow();

app.listen(
  {
    port: Number(envProvider.get('PORT')) || 3000,
    host: '0.0.0.0',
  },
  (error, address) => {
    if (error) {
      app.log.error(error);
      process.exit(1);
    }

    app.log.info(`server listening on ${address}`);

    process.on('SIGINT', async () => {
      app.log.info('Shutting down server...');
      await app.close();
      process.exit(0);
    });
  },
);
