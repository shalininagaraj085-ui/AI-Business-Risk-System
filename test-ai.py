import requests

data = {
    "monthlyRevenue": 250000,
    "monthlyExpenses": 150000,
    "cashBalance": 300000,

    "monthlySales": 120,
    "previousMonthSales": 100,
    "salesGrowthRate": 20,

    "totalCustomers": 500,
    "newCustomers": 60,
    "lostCustomers": 20,
    "customerChurnRate": 4,
    "customerSatisfaction": 85,

    "totalInventory": 1000,
    "lowStockItems": 50,
    "outOfStockItems": 10,
    "deadStockItems": 30,

    "totalSuppliers": 10,
    "delayedSuppliers": 2,
    "supplierDependencyRate": 30
}

response = requests.post(
    "http://localhost:8000/api/risk/analyze",
    json=data
)

print("Status:", response.status_code)
print("Response:")
print(response.json())