```jsp
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<html>
<head>
    <title>Currency Exchange Rates</title>
</head>
<body>
    <h1>Real-time Currency Rates</h1>
    <table border="1">
        <thead>
            <tr>
                <th>Currency</th>
                <th>Rate</th>
            </tr>
        </thead>
        <tbody>
            <c:forEach var="entry" items="${currencyRates}">
                <tr>
                    <td>${entry.key}</td>
                    <td>${entry.value}</td>
                </tr>
            </c:forEach>
        </tbody>
    </table>
</body>
</html>
```