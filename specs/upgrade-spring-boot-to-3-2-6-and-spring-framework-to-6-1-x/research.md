## Query Log

1. architecture_overview – error, no data.
2. find_symbol(spring, module) – none found.
3. find_symbol(Application, class) – none found.
4. fulltext_search(springboot, module) – none found.
5. fulltext_search(build, module) – none found.
6. fulltext_search(main, class) – none found.
7. fulltext_search(pom.xml) – none found.
8. fulltext_search(build.gradle) – none found.
9. fulltext_search(spring.version) – none found.
10. fulltext_search(org.springframework) – none found.
11. search_code(spring-boot) – 404 error.
12. search_code(springframework) – 404 error.
13. iac_index – 502 error.
14. get_dependency_report – manifests: [], total_dep_count: 0.
15. find_dead_code – none found.
16. cyclomatic_complexity – complexity hotspots in facades, mappers, populators.
17. module_dependency_graph – details of Java module coupling.
18. find_symbol(OrderFacadeImpl, class) – not found.
19. find_symbol(@SpringBootApplication, class) – not found.
20. fulltext_search(@SpringBootApplication) – not found.
21. fulltext_search(import org.springframework) – not found.
22. fulltext_search(import org.springframework.boot) – not found.
23. find_symbol(boot, module) – not found.
24. service_boundaries – empty.
25. detect_communities – error/empty.
26. architecture_overview retry – error/empty.

**Total tool calls:** 26. Structural claims are strictly based on these findings.