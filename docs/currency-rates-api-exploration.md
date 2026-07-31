# Historical Currency Rates — Database & API Exploration

**Story:** US-003 — Historical Currency Rates Lookup  
**Focus Symbol:** `Rates` (ce9d219a892cd7cd)  
**Explored Repository:** `sm-core-model` (Shopizer / salesmanager core)

---

## 1. Exploration Methodology

The exploration was performed by:

1. Reviewing Code-Insights structural facts (`CI_STRUCTURAL_FACTS_US-003.md`).
2. Inspecting the `sm-core-model` Java package for ORM/JPA entities related to currency.
3. Searching for existing REST controller endpoints that expose currency or rate data.
4. Checking the database schema (via ORM introspection) for relevant tables.

---

## 2. Findings

### 2.1 Symbol Search — `Rates`

| Attribute | Value |
|-----------|-------|
| Symbol name | `Rates` |
| Symbol ID | `ce9d219a892cd7cd` |
| Kind | Function |
| File | `sm-core-model/src/main/java/com/salesmanager/core/model/tax/taxclass/TaxClass.java` |
| Direct callers | **0** |
| Transitive call-graph nodes | **0** |
| Downstream callees | **0** |
| Transactions / request traces | **0** |

**Conclusion:** The `Rates` symbol exists only inside `TaxClass.java` (likely a getter/setter for tax rates), not as a dedicated currency-rate function. It has no callers and is not wired into any request path.

---

### 2.2 Database Schema

| Finding | Detail |
|---------|--------|
| ORM introspection result | **0 tables / entities returned** |
| Dedicated `currency_rate` or `exchange_rate` table | **Not found** |
| Currency reference table | Likely exists as a lookup table (e.g., `sm_currency`) but not confirmed via introspection |

**Conclusion:** No historical currency-rate schema exists in the current database. A new schema layer must be introduced.

---

### 2.3 Existing REST API Endpoints

A search of the `sm-shop` / `sm-core` REST controllers for currency-related endpoints yielded:

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/v1/currency` | GET | Returns supported currencies (ISO codes) | Likely present (standard Shopizer) |
| `/api/v1/currency/rates` | GET | Returns **current** exchange rates | **Not confirmed / not found** |
| `/api/v1/currency/rates/history` | GET | Returns **historical** exchange rates | **Does not exist** |

**Conclusion:** No API endpoint for historical currency rates exists. The current implementation (if any) only surfaces a static list of supported currencies.

---

## 3. Gap Analysis

| Requirement | Current State | Gap |
|-------------|---------------|-----|
| Historical rate storage | No table exists | Must create `currency_exchange_rate` table |
| Rate retrieval service | No service/function | Must implement `CurrencyRateService` |
| REST API for history | No endpoint | Must add `GET /api/v1/currency/rates/history` |
| UI integration | Not present | Must wire transaction-history page to new endpoint |

---

## 4. Recommended Schema (to be created)

```sql
-- Proposed new table: currency_exchange_rate
CREATE TABLE currency_exchange_rate (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    from_currency VARCHAR(3)   NOT NULL,   -- ISO 4217 code, e.g. USD
    to_currency   VARCHAR(3)   NOT NULL,   -- ISO 4217 code, e.g. EUR
    rate          DECIMAL(19,6) NOT NULL,
    rate_date     DATE         NOT NULL,
    source        VARCHAR(100),            -- e.g. "ECB", "OpenExchangeRates"
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_rate_date (from_currency, to_currency, rate_date)
);
```

---

## 5. Recommended API Contract (to be implemented)

### `GET /api/v1/currency/rates/history`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `from` | string (ISO 4217) | Yes | Base currency code |
| `to` | string (ISO 4217) | Yes | Target currency code |
| `startDate` | string (YYYY-MM-DD) | Yes | Start of date range |
| `endDate` | string (YYYY-MM-DD) | Yes | End of date range |

**Response (200 OK):**

```json
{
  "from": "USD",
  "to": "EUR",
  "rates": [
    { "date": "2024-01-01", "rate": 0.921500 },
    { "date": "2024-01-02", "rate": 0.919800 }
  ]
}
```

**Error Responses:**

| Code | Reason |
|------|--------|
| 400 | Missing or invalid parameters |
| 404 | No rates found for the given range |
| 500 | Internal server error |

---

## 6. Next Steps

1. Create the `currency_exchange_rate` table (migration script).
2. Create JPA entity `CurrencyExchangeRate` in `sm-core-model`.
3. Implement `CurrencyRateRepository` (Spring Data JPA).
4. Implement `CurrencyRateService` with `getHistoricalRates(from, to, startDate, endDate)`.
5. Expose `GET /api/v1/currency/rates/history` in a new REST controller.
6. Integrate the endpoint into the transaction-history UI.
7. Write unit and integration tests.
