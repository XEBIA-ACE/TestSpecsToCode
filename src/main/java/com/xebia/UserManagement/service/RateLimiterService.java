```java
package com.xebia.UserManagement.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class RateLimiterService {

    private static final int MAX_ATTEMPTS = 5;
    private static final Duration LOCKOUT_DURATION = Duration.ofHours(1);

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    public boolean isAllowed(String userId) {
        String key = "password-change-attempts:" + userId;
        Integer attempts = (Integer) redisTemplate.opsForValue().get(key);

        if (attempts == null) {
            attempts = 0;
        }

        if (attempts >= MAX_ATTEMPTS) {
            return false;
        }

        redisTemplate.opsForValue().increment(key);
        redisTemplate.expire(key, LOCKOUT_DURATION);
        return true;
    }

    public void lockout(String userId) {
        String key = "password-change-attempts:" + userId;
        redisTemplate.opsForValue().set(key, MAX_ATTEMPTS);
        redisTemplate.expire(key, LOCKOUT_DURATION);
    }
}
```