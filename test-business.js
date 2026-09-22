const http = require("http");

const data = JSON.stringify({
    businessName: "Tech Solutions",
    ownerName: "Test Owner",
    category: "Technology",
    location: "Salem",
    industry: "IT Services",

    monthlyRevenue: 250000,
    monthlyExpenses: 150000,
    monthlyProfit: 100000,
    cashBalance: 300000,

    monthlySales: 120,
    previousMonthSales: 100,
    salesGrowthRate: 20,

    totalCustomers: 500,
    newCustomers: 60,
    lostCustomers: 20,
    customerChurnRate: 4,
    customerSatisfaction: 85,

    totalInventory: 1000,
    lowStockItems: 50,
    outOfStockItems: 10,
    deadStockItems: 30,

    totalSuppliers: 10,
    delayedSuppliers: 2,
    supplierDependencyRate: 30
});

const options = {
    hostname: "localhost",
    port: 5000,
    path: "/api/businesses",
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data)
    }
};

const req = http.request(options, (res) => {
    let body = "";

    res.on("data", (chunk) => {
        body += chunk;
    });

    res.on("end", () => {
        console.log("Status:", res.statusCode);
        console.log("Response:", body);
    });
});

req.on("error", (error) => {
    console.error("Error:", error.message);
});

req.write(data);
req.end();