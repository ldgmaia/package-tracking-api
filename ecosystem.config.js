import fs from 'fs'

module.exports = {
  apps: [
    {
      name: 'package-tracking',
      script: 'build/server.js',
      env: fs
        .readFileSync('.env', 'utf-8')
        .split('\n')
        .filter(Boolean)
        .reduce((env, line) => {
          const [key, value] = line.split('=')
          env[key] = value
          return env
        }, {}),
    },
  ],
}
