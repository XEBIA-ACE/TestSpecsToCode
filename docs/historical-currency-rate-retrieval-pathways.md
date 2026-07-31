# Data Retrieval Pathways for Historical Currency Rates

## Overview

This document defines the theoretical and implemented data retrieval pathways
for accessing historical currency exchange rates as part of the
**Historical Currency Rates Lookup** feature (US-003).

---

## Pathway 1 — Local Database (Primary)

```
Caller (REST Controller / UI)
    └─► HistoricalCurrencyRateService
            └─► HistoricalCurrencyRateRepository
                    └─► Relational DB table: currency_historical_rate
```

### When it is used
- Any time a rate for a given currency pair + date has previously been fetched
  and persisted.

### Characteristics
| Property       | Value                                      |
|----------------|--------------------------------------------|
| Latency        | Low (local DB query)                       |
| Availability   | High (no external dependency)              |
| Data freshness | Depends on last fetch / cache invalidation |
| Cost           | Negligible (no API quota consumed)         |

### Key classes
| Class | Role |
|-------|------|
| `HistoricalCurrencyRateRepository` | Interface defining DB query methods |
| `HistoricalCurrencyRate` | Domain model / entity |

---

## Pathway 2 — External Exchange-Rate API (Fallback)

```
Caller (REST Controller / UI)
    └─► HistoricalCurrencyRateService
            └─► ExternalCurrencyRateClient
                    └─► HTTPS GET {baseUrl}/{date}?base={base}&symbols={target}&access_key={key}
                            └─► JSON response → HistoricalCurrencyRate
            └─► HistoricalCurrencyRateRepository.save(...)   ← cache result
```

### When it is used
- When the local DB has no record for the requested currency pair + date
  (cache miss).

### Supported providers (compatible endpoint format)
| Provider | Base URL |
|----------|----------|
| exchangeratesapi.io | `https://api.exchangeratesapi.io/v1` |
| Open Exchange Rates | `https://openexchangerates.org/api/historical` |
| Fixer.io | `https://data.fixer.io/api` |

### Characteristics
| Property       | Value                                                  |
|----------------|--------------------------------------------------------|
| Latency        | Medium (external HTTP call, ~100–500 ms)               |
| Availability   | Dependent on provider SLA                              |
| Data freshness | Real-time historical data from provider                |
| Cost           | API quota consumed per request                         |

### Key classes
| Class | Role |
|-------|------|
| `ExternalCurrencyRateClient` | Interface for external API calls |
| `HttpExternalCurrencyRateClient` | HTTP implementation using `java.net.http.HttpClient` |
| `CurrencyRateRetrievalException` | Checked exception for API failures |

---

## Pathway Selection Logic

Implemented in `HistoricalCurrencyRateServiceImpl`:

```
getRate(baseCurrency, targetCurrency, date):
  1. result = repository.findByPairAndDate(...)
  2. if result present  →  return result          [Pathway 1]
  3. result = externalClient.fetchRate(...)
  4. if result present  →  repository.save(result)
                           return result          [Pathway 2 + cache]
  5. return empty                                 [data unavailable]
```

---

## Data Model

```
HistoricalCurrencyRate
├── baseCurrency   : String   (ISO 4217, e.g. "USD")
├── targetCurrency : String   (ISO 4217, e.g. "EUR")
├── rate           : BigDecimal  (1 base unit expressed in target)
├── rateDate       : LocalDate
└── source         : String   ("DB" | "ExternalAPI")
```

---

## Non-Functional Considerations

| Concern        | Mitigation                                                                 |
|----------------|----------------------------------------------------------------------------|
| Performance    | Pathway 1 (DB) serves cached data with minimal latency                     |
| Scalability    | DB-first approach reduces external API calls under high query volume       |
| Security       | API key injected via configuration; HTTPS enforced for all external calls  |
| Maintainability| Interface-based design allows swapping providers without service changes   |
| Data accuracy  | External provider is the authoritative source; DB is a read-through cache  |

---

## Future Enhancements

- **Batch pre-fetch**: scheduled job to pre-populate the DB for commonly queried
  currency pairs, reducing Pathway 2 invocations.
- **Cache invalidation**: TTL-based eviction for rates older than a configurable
  threshold to allow re-fetch if provider data is corrected.
- **Circuit breaker**: wrap `ExternalCurrencyRateClient` calls with a circuit
  breaker (e.g. Resilience4j) to prevent cascading failures when the provider
  is unavailable.
