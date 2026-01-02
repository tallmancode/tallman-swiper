# Sentry Data Governance Policy

## Overview

This document defines what data is allowed to be transmitted to Sentry for error monitoring and performance tracking, and what data must be scrubbed or excluded to protect user privacy and security.

## Allowed Data Categories

The following data categories are **permitted** to be sent to Sentry:

### 1. Error Information
- **Exception types and messages**: Stack traces, error names, and error messages
- **Source locations**: File paths, line numbers, and column numbers
- **Browser context**: Browser type, version, and viewport dimensions
- **Operating system**: OS type and version (non-identifying)

### 2. Performance Metrics
- **Transaction names**: Route paths and component names (without query parameters)
- **Timing data**: Load times, response times, and performance marks
- **Resource metrics**: Asset load times (scripts, styles, images)

### 3. Application Context
- **Environment**: Environment name (production, staging)
- **Release version**: Git commit SHA or version number
- **Page URLs**: Pathname only (query parameters are redacted)
- **User interactions**: Click events, navigation events (without form data)

### 4. Technical Metadata
- **Session data**: Anonymous session IDs (no user identifiers)
- **Device information**: Screen resolution, device type (mobile/desktop)
- **Network conditions**: Connection type (if available)

## Prohibited Data Categories

The following data categories are **strictly prohibited** from being sent to Sentry:

### 1. Personally Identifiable Information (PII)
- User names, email addresses, phone numbers
- IP addresses (beyond what Sentry collects by default)
- Physical addresses or location data
- Social security numbers, government IDs
- Biometric data

### 2. Authentication & Authorization
- Passwords, password hashes, or password reset tokens
- API keys, access tokens, refresh tokens
- Session tokens, JWT tokens, OAuth tokens
- CSRF tokens, authentication cookies
- Authorization headers

### 3. Financial Information
- Credit card numbers, CVV codes, expiration dates
- Bank account numbers, routing numbers
- Payment processor tokens
- Transaction amounts or financial records

### 4. User-Generated Content
- Form input values (text fields, textareas, etc.)
- File uploads or file contents
- Private messages or communications
- User preferences containing sensitive data

### 5. Request/Response Data
- Request bodies containing form data
- Query parameters (automatically redacted)
- Response bodies containing user data
- Cookies (automatically redacted)

## Implementation

### Configuration Settings

The Sentry SDK is configured with the following security settings in `src/utils/sentry.ts`:

```typescript
{
  sendDefaultPii: false,           // Disable automatic PII transmission
  tracesSampleRate: 0.1,           // Sample 10% of transactions
  beforeSend: beforeSend,          // Scrub sensitive data before sending
  environment: 'production',       // Only allowed environments
}
```

### Data Scrubbing

The `beforeSend` hook automatically scrubs:

1. **Sensitive Headers**: Authorization, Cookie, X-API-Key, X-Auth-Token, X-CSRF-Token, X-Session-Id
2. **Query Parameters**: All URL query strings are replaced with `[Query Redacted]`
3. **Form Data**: All request bodies and form data are replaced with `[Redacted]`
4. **User Input**: UI input breadcrumbs are replaced with `[Input Redacted]`
5. **User Context**: Custom user context is removed entirely

### Environment Controls

Sentry initialization is restricted to approved environments:

- **Allowed**: `production`, `staging`, `development`
- **Blocked**: `test` and any unlisted environments
- **Required**: `VITE_SENTRY_ENV` must be explicitly set (no default fallback)

Sentry will **only** initialize when both `VITE_SENTRY_DSN` and `VITE_SENTRY_ENV` are explicitly configured. This allows controlled error monitoring across all development stages while preventing accidental initialization when environment variables are not properly set.

## Sampling Rates

### Traces Sample Rate: 10% (0.1)

**Rationale**: 
- Reduces telemetry volume by 90% compared to full sampling
- Maintains sufficient coverage for performance monitoring
- Minimizes data exposure while preserving observability
- Reduces Sentry quota usage and costs

**Coverage**:
- 10% sampling provides statistically significant data for:
  - Identifying slow transactions and performance bottlenecks
  - Detecting error patterns and trends
  - Monitoring application health metrics

### Error Capture Rate: 100%

**Rationale**:
- All errors are captured (not sampled) to ensure no critical issues are missed
- Errors are less frequent than performance traces
- Error data is already scrubbed via `beforeSend` hook

## Compliance Considerations

### GDPR (General Data Protection Regulation)
- No PII is transmitted to Sentry without explicit scrubbing
- Users are not individually identifiable from Sentry data
- Data retention follows Sentry's standard policies (90 days default)

### CCPA (California Consumer Privacy Act)
- No personal information is sold or shared with third parties
- Sentry data is used solely for error monitoring and performance optimization

### Data Minimization
- Only essential data for debugging and monitoring is transmitted
- Aggressive scrubbing removes any potentially sensitive information
- Sampling reduces overall data volume

## Review and Updates

This policy should be reviewed:

1. **Quarterly**: Regular review of scrubbing effectiveness
2. **When adding new features**: Assess if new data types require additional scrubbing
3. **After security incidents**: Update policy based on lessons learned
4. **When Sentry SDK is updated**: Verify new features don't bypass scrubbing

## Incident Response

If sensitive data is accidentally transmitted to Sentry:

1. **Immediate**: Delete the affected events from Sentry dashboard
2. **Short-term**: Review and update `beforeSend` hook to prevent recurrence
3. **Long-term**: Update this policy and notify relevant stakeholders

## Contact

For questions about this policy or to report potential data leakage:
- Review the implementation in `src/utils/sentry.ts`
- Check Sentry dashboard for unexpected data patterns
- Update scrubbing rules as needed

## Version History

- **v1.2** (2026-01-02): Made VITE_SENTRY_ENV required and removed production-only restriction
  - Removed `import.meta.env.PROD` check to allow Sentry in development mode
  - Made `VITE_SENTRY_ENV` required (removed default fallback to 'production')
  - Sentry now only initializes when both DSN and ENV are explicitly set

- **v1.1** (2026-01-02): Added development environment to allowlist
  - Enabled Sentry initialization in development environment for debugging
  
- **v1.0** (2026-01-02): Initial policy created as part of security hardening initiative
  - Disabled `sendDefaultPii`
  - Reduced `tracesSampleRate` from 1.0 to 0.1
  - Implemented comprehensive `beforeSend` scrubbing
  - Added environment allowlist (production, staging only)

