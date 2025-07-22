// src/utils/sentry.ts
import * as Sentry from '@sentry/node';
import type { Application } from 'express';

/**
 * Initialize Sentry for error monitoring and performance tracing.
 * Must be called before any imports of other modules to enable auto-instrumentation.
 */
export function initSentry(): void {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT,
    attachStacktrace: true,
    // Enable performance tracing (auto-instrumented HTTP/Express/etc.)
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '1.0'),
  });
}

// Export the Sentry instance for capturing exceptions and setting up Express handlers
export default Sentry;
