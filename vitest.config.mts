import { resolve } from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setup.ts',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/e2e/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/utils.ts', 'src/lib/redis.ts', 'src/app/api/**/*.ts'],
      exclude: [
        'node_modules/**',
        'src/tests/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**',
        'dist/**',
        '.next/**',
        'coverage/**',
        'playwright.config.ts',
        'e2e/**',
        'src/module/buy-corn/hooks/**',
        'src/module/buy-corn/services/**',
        'src/components/**',
        'src/module/buy-corn/types/**',
        'src/app/page.tsx',
        'src/app/layout.tsx',
        'src/app/**/layout.tsx',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
