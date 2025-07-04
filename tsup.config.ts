import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/**/*.ts'],
  outDir: 'build',
  loader: {
    '.db': 'copy',
    '.wsdl': 'copy',
  },
  publicDir: true, // This will copy all files in public directory
  // If you need to copy files from other directories, use the `onSuccess` hook:
  onSuccess:
    'cp src/db/package-tracking.db build/db/ && cp src/services/carriers/TrackingService.wsdl build/services/carriers/',
})
