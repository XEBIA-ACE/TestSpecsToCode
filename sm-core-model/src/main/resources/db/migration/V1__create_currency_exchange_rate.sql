-- Migration: V1__create_currency_exchange_rate.sql
-- Story: US-003 — Historical Currency Rates Lookup
--
-- Exploration finding: no currency_exchange_rate table exists in the current schema.
-- This script creates the table required to store historical exchange-rate data.
--
-- Columns:
--   id            — surrogate primary key
--   from_currency — ISO 4217 base currency code (e.g. USD)
--   to_currency   — ISO 4217 target currency code (e.g. EUR)
--   rate          — exchange rate: 1 unit of from_currency expressed in to_currency
--   rate_date     — the calendar date for which this rate is valid
--   source        — optional data-source label (e.g. ECB, OpenExchangeRates)
--   created_at    — row-insertion timestamp (audit)
--
-- Unique constraint: one rate per (from_currency, to_currency, rate_date) triple.

CREATE TABLE IF NOT EXISTS currency_exchange_rate (
    id            BIGINT        NOT NULL AUTO_INCREMENT,
    from_currency VARCHAR(3)    NOT NULL COMMENT 'ISO 4217 base currency code',
    to_currency   VARCHAR(3)    NOT NULL COMMENT 'ISO 4217 target currency code',
    rate          DECIMAL(19,6) NOT NULL COMMENT '1 unit of from_currency in to_currency',
    rate_date     DATE          NOT NULL COMMENT 'Date for which this rate is valid',
    source        VARCHAR(100)           COMMENT 'Data provider, e.g. ECB',
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_currency_rate_date (from_currency, to_currency, rate_date),
    INDEX idx_rate_date (rate_date),
    INDEX idx_from_to   (from_currency, to_currency)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Historical currency exchange rates — created for US-003';
