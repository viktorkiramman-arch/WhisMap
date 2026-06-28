import { env } from './config/env.js'
import { buildApp } from './app.js'

const start = async (): Promise<void> => {
  const app = await buildApp()

  try {
    await app.listen({ port: env.PORT, host: env.HOST })
  } catch (error) {
    app.log.error(error, 'Unable to start WhisMap API')
    process.exitCode = 1
    await app.close()
  }
}

void start()
