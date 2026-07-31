### Quality Standards & Design Principles

- **Zero Hallucination**: All upgrade work and inventory is based strictly on CAST MCP discovery, per GR-01/02.
- **Source Traceability**: All objects referenced are listed by both name and object ID as returned by CAST MCP, per GR-04/05.
- **Code Conventions**: Adhere to Java and Spring Boot/Framework style guidelines.
- **Compatibility Assurance**: Ensure adherence to upstream Spring migration notes, but only as confirmed by local tests and CAST-detected usage patterns.
- **Testing**: Full regression required for all online (HTTP/MVC) entry points impacted.
- **Documentation**: Changes and artifact upgrade steps must be logged and traceable back to source CAST queries.
- **Standing Compliance Gaps**: Flag and document all areas where BCM or subsystem scope is missing.
