```java
package com.salesmanager.core.business.services.reference.currency;

import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class CurrencyController {

    private final CurrencyRateService currencyRateService;

    @Autowired
    public CurrencyController(CurrencyRateService currencyRateService) {
        this.currencyRateService = currencyRateService;
    }

    @GetMapping("/currency-rates")
    public String showCurrencyRates(Model model) {
        Map<String, Double> rates = currencyRateService.getCurrencyRates();
        model.addAttribute("currencyRates", rates);
        return "pages/currencyRates";
    }
}
```