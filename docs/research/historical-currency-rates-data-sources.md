# Historical Currency Rates — Data Source Analysis

**Story:** US-003 — Historical Currency Rates Lookup  
**Purpose:** Identify and evaluate external data sources / services that can supply
historical foreign-exchange rates for integration into the transaction history feature.

---

## 1. Candidate Data Sources

### 1.1 Open Exchange Rates (openexchangerates.org)

| Attribute | Detail |
|-----------|--------|
| Type | REST API (JSON) |
| Coverage | 170+ currencies |
| History depth | Back to 1999 (USD base on free tier) |
| Update frequency | Hourly (paid), daily (free) |
| Authentication | API key |
| Free tier | Yes — 1 000 req/month |
| Paid plans | From ~$12/month |

**Pros**
- Simple, well-documented REST API; easy to integrate.
- Reliable uptime SLA on paid plans.
- SDKs available for Java and other JVM languages.

**Cons**
- Free tier is USD-base only; arbitrary base currency requires a paid plan.
- Rate limits may be restrictive for high-volume lookups.
- Vendor lock-in risk if the service changes pricing.

---

### 1.2 Fixer.io (fixer.io)

| Attribute | Detail |
|-----------|--------|
| Type | REST API (JSON) |
| Coverage | 170+ currencies |
| History depth | Back to 1999 |
| Update frequency | Hourly (paid), daily (free) |
| Authentication | API key |
| Free tier | Yes — 100 req/month |
| Paid plans | From ~$10/month |

**Pros**
- EUR base on free tier (useful for EU-centric transactions).
- Historical endpoint (`/YYYY-MM-DD`) maps directly to a date-based lookup.
- Widely used; large community and examples available.

**Cons**
- Very low free-tier request quota (100/month).
- HTTPS access requires a paid plan.
- Owned by APILayer — occasional reliability concerns reported in community forums.

---

### 1.3 European Central Bank (ECB) — Free XML Feed

| Attribute | Detail |
|-----------|--------|
| Type | XML feed (no auth required) |
| Coverage | ~32 major currencies (EUR base) |
| History depth | Back to 1999 |
| Update frequency | Daily (business days only) |
| Authentication | None |
| Cost | Free |

**Pros**
- Completely free with no API key or rate limits.
- Official, authoritative source — suitable for compliance/audit scenarios.
- 90-day rolling feed and full history file available for bulk download.

**Cons**
- EUR base only; cross-rate calculation required for other base currencies.
- XML format requires parsing (less convenient than JSON).
- No intraday rates; only one rate per business day.
- Limited currency coverage compared to commercial providers.

---

### 1.4 ExchangeRate-API (exchangerate-api.com)

| Attribute | Detail |
|-----------|--------|
| Type | REST API (JSON) |
| Coverage | 160+ currencies |
| History depth | Back to 1990 (paid) |
| Update frequency | Daily |
| Authentication | API key |
| Free tier | Yes — 1 500 req/month |
| Paid plans | From ~$10/month |

**Pros**
- Generous free tier (1 500 req/month).
- HTTPS on free tier.
- Clean, consistent JSON response structure.

**Cons**
- Historical data only available on paid plans.
- Smaller community than Open Exchange Rates or Fixer.

---

### 1.5 CurrencyLayer (currencylayer.com)

| Attribute | Detail |
|-----------|--------|
| Type | REST API (JSON) |
| Coverage | 168 currencies |
| History depth | Back to 1999 |
| Update frequency | Hourly (paid), daily (free) |
| Authentication | API key |
| Free tier | Yes — 100 req/month |
| Paid plans | From ~$9.99/month |

**Pros**
- Dedicated `/historical` endpoint with flexible date range queries.
- Supports time-series queries (multiple dates in one call on paid plans).
- Backed by the same data provider as Fixer.

**Cons**
- Free tier limited to 100 req/month and HTTP only.
- HTTPS and historical access require a paid subscription.

---

## 2. Comparison Matrix

| Provider | Free Tier | History Depth | Currency Count | Auth Required | HTTPS Free | JSON |
|----------|-----------|---------------|----------------|---------------|------------|------|
| Open Exchange Rates | ✅ 1 000/mo | 1999 | 170+ | API key | ✅ | ✅ |
| Fixer.io | ✅ 100/mo | 1999 | 170+ | API key | ❌ | ✅ |
| ECB Feed | ✅ Unlimited | 1999 | ~32 | None | ✅ | ❌ (XML) |
| ExchangeRate-API | ✅ 1 500/mo | 1990 (paid) | 160+ | API key | ✅ | ✅ |
| CurrencyLayer | ✅ 100/mo | 1999 | 168 | API key | ❌ | ✅ |

---

## 3. Recommendation

### Primary: Open Exchange Rates (paid "Developer" plan)

**Rationale:**
- Broad currency coverage (170+) satisfies the full scope of the transaction history feature.
- Well-maintained Java client libraries reduce integration effort.
- Reasonable cost for the expected query volume.
- HTTPS on all plans satisfies the security non-functional requirement from `constitution.md`.
- Stable, documented API minimises maintenance burden.

### Fallback / Offline Seed: ECB Free XML Feed

**Rationale:**
- Zero cost; no API key management.
- Suitable for seeding a local cache or database table with historical EUR-base rates.
- Can be used as a secondary source to cross-validate commercial data.
- Eliminates external dependency for the 32 covered currencies during development and testing.

---

## 4. Integration Approach (High-Level)

```
Transaction History UI
        │
        ▼
CurrencyRateService (new Java service class)
        │
        ├─► CurrencyRateRepository (local DB cache — avoids repeated API calls)
        │         └─► currency_rate table  (date, base_currency, target_currency, rate)
        │
        └─► ExternalRateClient (HTTP adapter)
                  ├─► OpenExchangeRatesAdapter  (primary)
                  └─► EcbFeedAdapter            (fallback / seed)
```

- **Cache-first strategy:** Check the local `currency_rate` table before calling the external API.
  This satisfies the performance NFR (no significant page-load impact) and reduces API quota usage.
- **Scheduled refresh:** A background job (e.g., Spring `@Scheduled`) fetches and stores daily rates,
  keeping the cache warm without blocking user requests.
- **Security:** API keys stored in environment variables / secrets manager — never hard-coded.

---

## 5. Next Steps

1. Confirm budget approval for Open Exchange Rates paid plan (or select ECB-only for MVP).
2. Create `currency_rate` database table / JPA entity.
3. Implement `CurrencyRateService` with cache-first lookup.
4. Wire service into the transaction history page backend.
5. Write unit and integration tests against both adapters.

---

*Document generated as part of US-003 task: "Analyze Data Sources for Historical Currency Rates".*
