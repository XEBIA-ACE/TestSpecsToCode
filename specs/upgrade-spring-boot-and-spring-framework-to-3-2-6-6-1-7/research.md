### CAST Findings

#### Query Log

| # | Tool/Query Type | Scope & Filters | Result Count | Disposition | Name/ID Pairs Returned |
|---|-----------------|----------------|--------------|-------------|------------------------|
| 1 | applications | — | 9 | run-returned | Shopizer-3.2.5 (N/A) |
| 2 | stats | application=Shopizer-3.2.5 | 1 | run-returned | N/A |
| 3 | objects | application=Shopizer-3.2.5, filters="type:contains:Spring" | >50 | run-returned | See Appendix |

> **Snapshot ID/date:** Not available in CAST MCP — stats did not return snapshot info.

---

#### Appendix (CAST-derived findings; GR-04/05/06)

- Shopizer-3.2.5 (N/A) — Application confirmed in CAST (Source: CAST MCP — applications: Shopizer-3.2.5 / N/A / 1)
- Spring Bean: OrderTotalService (21201), file: sm-core/src/main/java/com/salesmanager/core/business/services/order/ordertotal/OrderTotalServiceImpl.java (Source: CAST MCP — objects: OrderTotalService / 21201 / 1)
- Spring MVC Get Operation: "/", id 13201, file: sm-shop/src/main/java/com/salesmanager/shop/store/api/DefaultController.java (Source: CAST MCP — objects: / / 13201 / 1)
- Spring MVC Get Operation: "api/v1/auth/cart/{}/shipping/", id 13155, file: sm-shop/src/main/java/com/salesmanager/shop/store/api/v1/order/OrderShippingApi.java (Source: CAST MCP — objects: api/v1/auth/cart/{}/shipping/ / 13155 / 1)
- Spring MVC Post Operation: "api/v1/auth/cart/{}/checkout/", id 10560, file: sm-shop/src/main/java/com/salesmanager/shop/store/api/v1/order/OrderApi.java (Source: CAST MCP — objects: api/v1/auth/cart/{}/checkout/ / 10560 / 1)
- Spring MVC Delete Operation: "api/v1/auth/product/images/{}/", id 25083, file: sm-shop/src/main/java/com/salesmanager/shop/store/api/v1/product/ProductImageApi.java (Source: CAST MCP — objects: api/v1/auth/product/images/{}/ / 25083 / 1)
- ... [additional Spring beans and MVC operations as listed in full objects result; truncated for brevity]

> **Standing Compliance Gap:** No BCM scope supplied; app-wide queries performed (GR-08).

##### Confidence Tiering

- All object inventory and types: ✅ direct CAST result.
- All proposed migration steps: ⚠️ analyst proposal only.

---

#### GR-12/13 Boundaries

- **Stated as N/A per instructions:** GR-12/13 do not apply to this feature spec.

---

**End of research.md**

---
