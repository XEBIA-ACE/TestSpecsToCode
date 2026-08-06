package com.example.monitoring;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import io.micrometer.core.instrument.Counter;

public class CurrencyRateMonitoringService {
    private final MeterRegistry meterRegistry;
    private final Timer updateTimer;
    private final Counter accuracyCounter;

    public CurrencyRateMonitoringService(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        this.updateTimer = meterRegistry.timer("currency.rate.update.time");
        this.accuracyCounter = meterRegistry.counter("currency.rate.update.accuracy.failures");
    }

    public void recordUpdateTime(long duration) {
        updateTimer.record(duration, java.util.concurrent.TimeUnit.MILLISECONDS);
    }

    public void recordAccuracyFailure() {
        accuracyCounter.increment();
    }
}