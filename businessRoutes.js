const express = require("express");

const Business = require("./businessModel");
const { calculateRisk } = require("./riskEngine");

const router = express.Router();


// =====================================================
// AI BUSINESS COPILOT
// =====================================================

router.post("/:id/copilot", async (req, res) => {

    try {

        const business =
            await Business.findById(req.params.id);

        if (!business) {

            return res.status(404).json({
                success: false,
                message: "Business not found"
            });

        }

        const question =
            String(req.body.question || "").trim();

        if (!question) {

            return res.status(400).json({
                success: false,
                message: "Question is required"
            });

        }

        const answer =
    await generateCopilotAnswer(
        question,
        business
    );

        res.json({

            success: true,

            question: question,

            answer: answer

        });

    } catch (error) {

        console.error(
            "Copilot Error:",
            error
        );

        res.status(500).json({

            success: false,

            message: "AI Copilot failed",

            error: error.message

        });

    }

});

// =====================================================
// SMART FREE BUSINESS COPILOT
// =====================================================

function generateCopilotAnswer(question, business) {

    const q = String(question || "").trim().toLowerCase();

    // -------------------------------------------------
    // Business Data
    // -------------------------------------------------

    const businessName =
        business.businessName ||
        business.name ||
        "Selected Business";

    const category =
        business.category ||
        "Not Available";

    const location =
        business.location ||
        "Not Available";

    const revenue =
        Number(business.monthlyRevenue || 0);

    const expenses =
        Number(business.monthlyExpenses || 0);

    const profit = revenue - expenses;

    const expenseRatio =
        revenue > 0
            ? (expenses / revenue) * 100
            : 0;

    const profitMargin =
        revenue > 0
            ? (profit / revenue) * 100
            : 0;


    // -------------------------------------------------
    // Current Risk
    // -------------------------------------------------

    const riskScore =
        Number(
            business.overallRiskScore ??
            business.riskScore ??
            business.currentRiskScore ??
            0
        );

    const riskLevel =
        business.riskLevel ||
        business.currentRiskLevel ||
        (
            riskScore >= 75
                ? "Critical"
                : riskScore >= 50
                    ? "High"
                    : riskScore >= 25
                        ? "Medium"
                        : "Low"
        );


    // -------------------------------------------------
    // Future Risk
    // -------------------------------------------------

    const futureRiskScore =
        Number(
            business.futureRiskScore ??
            business.predictedFutureRiskScore ??
            0
        );

    const futureRiskLevel =
        business.futureRiskLevel ||
        (
            futureRiskScore >= 75
                ? "Critical"
                : futureRiskScore >= 50
                    ? "High"
                    : futureRiskScore >= 25
                        ? "Medium"
                        : "Low"
        );


    // =================================================
    // BUSINESS NAME
    // =================================================

    if (
        q.includes("business name") ||
        q.includes("company name") ||
        q.includes("name of business") ||
        q.includes("business peru") ||
        q.includes("company peru")
    ) {
        return `
🏢 Business Name

${businessName}
        `.trim();
    }


    // =================================================
    // CATEGORY
    // =================================================

    if (
        q.includes("category") ||
        q.includes("business type") ||
        q.includes("type of business")
    ) {
        return `
📂 Business Category

${category}
        `.trim();
    }


    // =================================================
    // LOCATION
    // =================================================

    if (
        q.includes("location") ||
        q.includes("where is") ||
        q.includes("where located") ||
        q.includes("place")
    ) {
        return `
📍 Business Location

${location}
        `.trim();
    }


    // =================================================
    // REVENUE
    // =================================================

    if (
        q.includes("revenue") ||
        q.includes("income") ||
        q.includes("sales") ||
        q.includes("varumanam") ||
        q.includes("varavu") ||
        q.includes("revenue evlo") ||
        q.includes("income evlo")
    ) {
        return `
💰 Monthly Revenue

🏢 Business: ${businessName}

💰 Revenue: ₹${revenue.toLocaleString("en-IN")}
        `.trim();
    }


    // =================================================
    // EXPENSE
    // =================================================

    if (
        q.includes("expense") ||
        q.includes("expenses") ||
        q.includes("cost") ||
        q.includes("selavu") ||
        q.includes("selavu evlo") ||
        q.includes("expense evlo")
    ) {
        return `
💸 Monthly Expenses

🏢 Business: ${businessName}

💸 Expenses: ₹${expenses.toLocaleString("en-IN")}

📊 Expense Ratio: ${expenseRatio.toFixed(2)}%
        `.trim();
    }


    // =================================================
    // PROFIT / LOSS
    // =================================================

    if (
        q.includes("profit") ||
        q.includes("loss") ||
        q.includes("earn") ||
        q.includes("labam") ||
        q.includes("nashtam")
    ) {

        if (profit >= 0) {

            return `
📈 Profit Analysis

🏢 Business: ${businessName}

💰 Revenue: ₹${revenue.toLocaleString("en-IN")}

💸 Expenses: ₹${expenses.toLocaleString("en-IN")}

📈 Monthly Profit: ₹${profit.toLocaleString("en-IN")}

📊 Profit Margin: ${profitMargin.toFixed(2)}%

✅ The business is currently operating with a profit.
            `.trim();

        }

        return `
📉 Loss Analysis

🏢 Business: ${businessName}

💰 Revenue: ₹${revenue.toLocaleString("en-IN")}

💸 Expenses: ₹${expenses.toLocaleString("en-IN")}

📉 Monthly Loss: ₹${Math.abs(profit).toLocaleString("en-IN")}

📊 Profit Margin: ${profitMargin.toFixed(2)}%

⚠️ The business is currently operating at a loss because expenses are higher than revenue.
        `.trim();
    }


    // =================================================
    // RISK
    // =================================================

    if (
        q.includes("risk") ||
        q.includes("danger") ||
        q.includes("risky") ||
        q.includes("risk enna") ||
        q.includes("risk epdi") ||
        q.includes("risk eppadi")
    ) {

        return `
⚠️ Business Risk Analysis

🏢 Business: ${businessName}

📊 Current Risk Score: ${riskScore}

🚨 Risk Level: ${riskLevel}

💰 Revenue: ₹${revenue.toLocaleString("en-IN")}

💸 Expenses: ₹${expenses.toLocaleString("en-IN")}

📈 Profit/Loss: ₹${profit.toLocaleString("en-IN")}

${
    expenses > revenue
        ? "🚨 Main Risk: Expenses are higher than revenue."
        : "✅ Revenue is currently higher than expenses."
}
        `.trim();
    }


    // =================================================
    // FUTURE RISK
    // =================================================

    if (
        q.includes("future") ||
        q.includes("prediction") ||
        q.includes("predict") ||
        q.includes("forecast") ||
        q.includes("future risk")
    ) {

        return `
🔮 Future Risk Prediction

🏢 Business: ${businessName}

📊 Current Risk Score: ${riskScore}

🚨 Current Risk Level: ${riskLevel}

🔮 Future Risk Score: ${futureRiskScore}

🚨 Future Risk Level: ${futureRiskLevel}

${
    futureRiskScore > riskScore
        ? "⚠️ Future risk is higher than the current risk."
        : futureRiskScore === riskScore
            ? "ℹ️ Future risk score is currently the same as the current risk score."
            : "✅ Future risk is not higher than the current risk."
}
        `.trim();
    }


    // =================================================
    // RECOMMENDATIONS
    // =================================================

    if (
        q.includes("recommend") ||
        q.includes("suggest") ||
        q.includes("advice") ||
        q.includes("improve") ||
        q.includes("reduce risk") ||
        q.includes("what should") ||
        q.includes("enna panna") ||
        q.includes("enna seiyanum") ||
        q.includes("epdi improve") ||
        q.includes("epdi reduce")
    ) {

        const recommendations = [];

        if (expenses > revenue) {

            recommendations.push(
                "💡 Reduce unnecessary operating expenses."
            );

            recommendations.push(
                "💡 Increase revenue through additional sales opportunities."
            );
        }

        if (profitMargin < 0) {

            recommendations.push(
                "💡 Improve profitability by controlling expenses and increasing revenue."
            );
        }

        if (riskScore >= 50) {

            recommendations.push(
                "⚠️ Monitor business risk regularly."
            );
        }

        if (recommendations.length === 0) {

            recommendations.push(
                "✅ Continue monitoring revenue, expenses and profitability."
            );
        }

        return `
💡 Business Recommendations

${recommendations.join("\n")}
        `.trim();
    }


    // =================================================
    // FINANCIAL SUMMARY
    // =================================================

    if (
        q.includes("summary") ||
        q.includes("overview") ||
        q.includes("financial") ||
        q.includes("full details") ||
        q.includes("all details")
    ) {

        return `
📊 Business Financial Summary

🏢 Business: ${businessName}

📂 Category: ${category}

📍 Location: ${location}

💰 Revenue: ₹${revenue.toLocaleString("en-IN")}

💸 Expenses: ₹${expenses.toLocaleString("en-IN")}

${
    profit >= 0
        ? `📈 Profit: ₹${profit.toLocaleString("en-IN")}`
        : `📉 Loss: ₹${Math.abs(profit).toLocaleString("en-IN")}`
}

📊 Expense Ratio: ${expenseRatio.toFixed(2)}%

📈 Profit Margin: ${profitMargin.toFixed(2)}%

⚠️ Current Risk Score: ${riskScore}

🚨 Current Risk Level: ${riskLevel}

🔮 Future Risk Score: ${futureRiskScore}

🔮 Future Risk Level: ${futureRiskLevel}
        `.trim();
    }


    // =================================================
    // DEFAULT RESPONSE
    // =================================================

    return `
🤖 AI Business Copilot

I can answer questions using the available business data.

🏢 Business: ${businessName}

📂 Category: ${category}

📍 Location: ${location}

💰 Revenue: ₹${revenue.toLocaleString("en-IN")}

💸 Expenses: ₹${expenses.toLocaleString("en-IN")}

📈 Profit/Loss: ₹${profit.toLocaleString("en-IN")}

📊 Risk Score: ${riskScore}

🚨 Risk Level: ${riskLevel}

🔮 Future Risk Score: ${futureRiskScore}

🔮 Future Risk Level: ${futureRiskLevel}

You can ask about revenue, expenses, profit, loss, risk, future risk, recommendations, financial summary, business name, category or location.
    `.trim();
}


// =====================================================
// RISK EXPLANATION HELPER
// =====================================================

function getRiskExplanation(score) {

    if (score >= 75) {

        return "The current analyzed data indicates a critical risk level.";

    }

    if (score >= 50) {

        return "The current analyzed data indicates a high risk level.";

    }

    if (score >= 25) {

        return "The current analyzed data indicates a medium risk level.";

    }

    return "The current analyzed data indicates a relatively low immediate risk level.";
}

// =====================================================
// CREATE BUSINESS
// =====================================================

router.post("/", async (req, res) => {

    try {

        const {
            businessName,
            category,
            location,
            monthlyRevenue,
            monthlyExpenses
        } = req.body;


        // ---------------------------------------------
        // Validate required fields
        // ---------------------------------------------

        if (
            !businessName ||
            !category ||
            !location ||
            monthlyRevenue === undefined ||
            monthlyExpenses === undefined
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Business Name, Category, Location, Revenue and Expenses are required."

            });

        }


        const revenue =
            Number(monthlyRevenue);

        const expenses =
            Number(monthlyExpenses);


        if (
            !Number.isFinite(revenue) ||
            !Number.isFinite(expenses) ||
            revenue < 0 ||
            expenses < 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Revenue and Expenses must be valid positive numbers."

            });

        }


        // ---------------------------------------------
        // Create business
        // ---------------------------------------------

        const business =
            await Business.create({

                businessName:
                    businessName.trim(),

                category:
                    category.trim(),

                location:
                    location.trim(),

                monthlyRevenue:
                    revenue,

                monthlyExpenses:
                    expenses,

                monthlyProfit:
                    revenue - expenses

            });


        res.status(201).json({

            success: true,

            message:
                "Business created successfully",

            business

        });

    } catch (error) {

        console.error(
            "Create Business Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to create business",

            error:
                error.message

        });
    }
});


// =====================================================
// GET ALL BUSINESSES
// =====================================================

router.get("/", async (req, res) => {

    try {

        const businesses =
            await Business.find()
                .sort({
                    createdAt: -1
                });


        res.json({

            success: true,

            count:
                businesses.length,

            businesses

        });

    } catch (error) {

        console.error(
            "Get Businesses Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch businesses"

        });
    }
});


// =====================================================
// GET BUSINESS BY ID
// =====================================================

router.get("/:id", async (req, res) => {

    try {

        const business =
            await Business.findById(
                req.params.id
            );


        if (!business) {

            return res.status(404).json({

                success: false,

                message:
                    "Business not found"

            });
        }


        res.json({

            success: true,

            business

        });

    } catch (error) {

        console.error(
            "Get Business Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch business"

        });
    }
});


// =====================================================
// UPDATE BUSINESS
// =====================================================

router.put("/:id", async (req, res) => {

    try {

        const allowedData = {

            businessName:
                req.body.businessName,

            category:
                req.body.category,

            location:
                req.body.location,

            monthlyRevenue:
                req.body.monthlyRevenue,

            monthlyExpenses:
                req.body.monthlyExpenses

        };


        // ---------------------------------------------
        // Calculate profit automatically
        // ---------------------------------------------

        if (
            req.body.monthlyRevenue !== undefined &&
            req.body.monthlyExpenses !== undefined
        ) {

            allowedData.monthlyProfit =
                Number(req.body.monthlyRevenue) -
                Number(req.body.monthlyExpenses);

        }


        const business =
            await Business.findByIdAndUpdate(

                req.params.id,

                allowedData,

                {
                    new: true,
                    runValidators: true
                }

            );


        if (!business) {

            return res.status(404).json({

                success: false,

                message:
                    "Business not found"

            });
        }


        res.json({

            success: true,

            message:
                "Business updated successfully",

            business

        });

    } catch (error) {

        console.error(
            "Update Business Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to update business",

            error:
                error.message

        });
    }
});


// =====================================================
// DELETE BUSINESS
// =====================================================

router.delete("/:id", async (req, res) => {

    try {

        const business =
            await Business.findByIdAndDelete(
                req.params.id
            );


        if (!business) {

            return res.status(404).json({

                success: false,

                message:
                    "Business not found"

            });
        }


        res.json({

            success: true,

            message:
                "Business deleted successfully"

        });

    } catch (error) {

        console.error(
            "Delete Business Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to delete business"

        });
    }
});


// =====================================================
// AI BUSINESS RISK ANALYSIS
// =====================================================

router.post("/:id/analyze-risk", async (req, res) => {

    try {

        // ---------------------------------------------
        // 1. Find business
        // ---------------------------------------------

        const business =
            await Business.findById(
                req.params.id
            );


        if (!business) {

            return res.status(404).json({

                success: false,

                message:
                    "Business not found"

            });
        }


        // ---------------------------------------------
        // 2. Prepare universal business data
        // ---------------------------------------------

        const revenue =
            Number(
                business.monthlyRevenue || 0
            );

        const expenses =
            Number(
                business.monthlyExpenses || 0
            );

        const profit =
            revenue - expenses;


        const aiData = {

            businessName:
                business.businessName,

            category:
                business.category,

            location:
                business.location,

            monthlyRevenue:
                revenue,

            monthlyExpenses:
                expenses,

            monthlyProfit:
                profit

        };


        // ---------------------------------------------
// 3. Run local AI risk engine
// ---------------------------------------------

console.log(
    `🤖 Analyzing ${business.businessName} financial data...`
);

const analysis =
    calculateRisk(aiData);

        // ---------------------------------------------
        // 5. Save AI result
        // ---------------------------------------------

        business.overallRiskScore =
    analysis.overallRiskScore || 0;

business.riskLevel =
    analysis.riskLevel || "Not analyzed";

business.futureRiskScore =
    analysis.futureRisk?.score || 0;

business.futureRiskLevel =
    analysis.futureRisk?.riskLevel || "Not analyzed";

business.aiPrediction =
    analysis.aiPrediction ||
    "No prediction available.";

business.lastRiskAnalysis =
    new Date();
        business.riskAnalysisHistory.push({
    riskScore: business.overallRiskScore,
    riskLevel: business.riskLevel,
    futureRiskScore: business.futureRiskScore,
    futureRiskLevel: business.futureRiskLevel,
    aiPrediction: business.aiPrediction,
    analyzedAt: new Date()
});

// Keep only the latest 10 risk analysis records
if (business.riskAnalysisHistory.length > 10) {
    business.riskAnalysisHistory =
        business.riskAnalysisHistory.slice(-10);
}


        await business.save();


        // ---------------------------------------------
        // 6. Send result to frontend
        // ---------------------------------------------

        res.json({

            success: true,

            message:
                "AI risk analysis completed",

            business: {

                id:
                    business._id,

                businessName:
                    business.businessName,

                category:
                    business.category,

                location:
                    business.location,

                monthlyRevenue:
                    business.monthlyRevenue,

                monthlyExpenses:
                    business.monthlyExpenses,

                monthlyProfit:
                    business.monthlyProfit,

                riskScore:
    business.overallRiskScore,

riskLevel:
    business.riskLevel,

futureRiskScore:
    business.futureRiskScore,

futureRiskLevel:
    business.futureRiskLevel,

aiPrediction:
    business.aiPrediction,

                lastRiskAnalysis:
                    business.lastRiskAnalysis

            },

            analysis:
                analysis

        });

    } catch (error) {

        console.error(
            "AI Risk Analysis Error:",
            error.message
        );



        res.status(500).json({

            success: false,

            message:
                "AI risk analysis failed",

            error:
                error.message

        });

    }

});


// =====================================================
// EXPLAINABLE AI
// =====================================================

router.get("/:id/explain-risk", async (req, res) => {

    try {

        const business =
            await Business.findById(
                req.params.id
            );


        if (!business) {

            return res.status(404).json({

                message:
                    "Business not found"

            });

        }


        const revenue =
            Number(
                business.monthlyRevenue || 0
            );

        const expenses =
            Number(
                business.monthlyExpenses || 0
            );


        const factors = [];


        // ---------------------------------------------
        // Financial Risk
        // ---------------------------------------------

        if (revenue <= 0) {

            factors.push({

                factor:
                    "Financial Risk",

                impact:
                    "High",

                reason:
                    "No valid revenue data is available."

            });

        }

        else if (
            expenses > revenue * 0.8
        ) {

            factors.push({

                factor:
                    "Financial Risk",

                impact:
                    "High",

                reason:
                    "Business expenses are very high compared with revenue."

            });

        }

        else if (
            expenses > revenue * 0.6
        ) {

            factors.push({

                factor:
                    "Financial Risk",

                impact:
                    "Medium",

                reason:
                    "Expense ratio is relatively high."

            });

        }

        else {

            factors.push({

                factor:
                    "Financial Risk",

                impact:
                    "Low",

                reason:
                    "Revenue is currently sufficient compared with expenses."

            });

        }


        // ---------------------------------------------
        // Profitability
        // ---------------------------------------------

        const profit =
            revenue - expenses;


        if (profit < 0) {

            factors.push({

                factor:
                    "Profitability Risk",

                impact:
                    "High",

                reason:
                    "Monthly expenses are higher than monthly revenue."

            });

        }

        else {

            factors.push({

                factor:
                    "Profitability Risk",

                impact:
                    "Low",

                reason:
                    "Monthly revenue is currently higher than monthly expenses."

            });

        }


        res.json({

            success: true,

            businessName:
                business.businessName,

            overallRiskScore:
                business.overallRiskScore || 0,

            riskLevel:
                business.riskLevel ||
                "Not analyzed",

            explanation:
                factors

        });

    } catch (error) {

        console.error(
            "Explainable AI Error:",
            error
        );

        res.status(500).json({

            message:
                "Unable to explain business risk"

        });

    }
});


// =====================================================
// WHAT-IF BUSINESS RISK SIMULATION
// =====================================================

router.post("/:id/simulate-risk", async (req, res) => {

    try {

        const business =
            await Business.findById(
                req.params.id
            );


        if (!business) {

            return res.status(404).json({

                success: false,

                message:
                    "Business not found"

            });

        }


        // ---------------------------------------------
        // Simulation values
        // ---------------------------------------------

        const simulatedRevenue =
            Number(
                req.body.revenue
            );

        const simulatedExpenses =
            Number(
                req.body.expenses
            );


        if (

            !Number.isFinite(
                simulatedRevenue
            ) ||

            !Number.isFinite(
                simulatedExpenses
            ) ||

            simulatedRevenue <= 0 ||

            simulatedExpenses < 0

        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter valid revenue and expense values."

            });

        }


        // ---------------------------------------------
        // Current risk
        // ---------------------------------------------

        const currentRiskScore =
            Number(
                business.overallRiskScore || 0
            );


        // ---------------------------------------------
        // Expense ratio
        // ---------------------------------------------

        const expenseRatio =
            (
                simulatedExpenses /
                simulatedRevenue
            ) * 100;


        // ---------------------------------------------
        // Simulated risk
        // ---------------------------------------------

        let simulatedRiskScore = 0;

if (expenseRatio >= 100) {

    simulatedRiskScore = 75;

}
else if (expenseRatio >= 90) {

    simulatedRiskScore = 50;

}
else if (expenseRatio >= 75) {

    simulatedRiskScore = 25;

}
else if (expenseRatio >= 60) {

    simulatedRiskScore = 10;

}
else {

    simulatedRiskScore = 5;

}


        // ---------------------------------------------
        // Keep between 0 and 100
        // ---------------------------------------------

        simulatedRiskScore =
            Math.min(

                100,

                Math.max(

                    0,

                    Math.round(
                        simulatedRiskScore
                    )

                )

            );


        // ---------------------------------------------
        // Risk level
        // ---------------------------------------------

        let simulatedRiskLevel;


        if (
            simulatedRiskScore >= 75
        ) {

            simulatedRiskLevel =
                "Critical";

        }

        else if (
            simulatedRiskScore >= 50
        ) {

            simulatedRiskLevel =
                "High";

        }

        else if (
            simulatedRiskScore >= 25
        ) {

            simulatedRiskLevel =
                "Medium";

        }

        else {

            simulatedRiskLevel =
                "Low";

        }


        // ---------------------------------------------
        // Message
        // ---------------------------------------------

        let simulationMessage;


        if (
            simulatedRiskScore >
            currentRiskScore
        ) {

            simulationMessage =
                "The simulated financial conditions increase the overall business risk.";

        }

        else if (
            simulatedRiskScore <
            currentRiskScore
        ) {

            simulationMessage =
                "The simulated financial conditions reduce the overall business risk.";

        }

        else {

            simulationMessage =
                "The simulated financial conditions produce a similar risk level.";

        }


        res.json({

            success: true,

            businessName:
                business.businessName,

            currentRiskScore:
                currentRiskScore,

            simulatedRiskScore:
                simulatedRiskScore,

            simulatedRiskLevel:
                simulatedRiskLevel,

            simulatedRevenue:
                simulatedRevenue,

            simulatedExpenses:
                simulatedExpenses,

            expenseRatio:
                Number(
                    expenseRatio.toFixed(2)
                ),

            message:
                simulationMessage

        });


    } catch (error) {

        console.error(
            "What-If Simulation Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "What-If simulation failed",

            error:
                error.message

        });

    }

});


// =====================================================
// ANOMALY DETECTION
// =====================================================

router.get("/:id/detect-anomalies", async (req, res) => {

    try {

        const business =
            await Business.findById(
                req.params.id
            );


        if (!business) {

            return res.status(404).json({

                success: false,

                message:
                    "Business not found"

            });

        }


        const anomalies = [];


        const revenue =
            Number(
                business.monthlyRevenue || 0
            );

        const expenses =
            Number(
                business.monthlyExpenses || 0
            );


        // ---------------------------------------------
        // Expense > Revenue
        // ---------------------------------------------

        if (
            revenue > 0 &&
            expenses > revenue
        ) {

            anomalies.push({

                type:
                    "Financial Anomaly",

                severity:
                    "High",

                message:
                    "Monthly expenses are higher than monthly revenue.",

                value: {

                    revenue:
                        revenue,

                    expenses:
                        expenses

                }

            });

        }


        // ---------------------------------------------
        // Very high expense ratio
        // ---------------------------------------------

        if (
            revenue > 0 &&
            expenses <= revenue &&
            expenses >= revenue * 0.8
        ) {

            anomalies.push({

                type:
                    "Financial Warning",

                severity:
                    "Medium",

                message:
                    "Monthly expenses are very high compared with revenue.",

                value: {

                    expenseRatio:
                        Number(
                            (
                                expenses /
                                revenue *
                                100
                            ).toFixed(2)
                        )

                }

            });

        }


        // ---------------------------------------------
        // Overall anomaly level
        // ---------------------------------------------

        let anomalyLevel =
            "Normal";


        if (
            anomalies.some(
                item =>
                    item.severity === "Critical"
            )
        ) {

            anomalyLevel =
                "Critical";

        }

        else if (
            anomalies.some(
                item =>
                    item.severity === "High"
            )
        ) {

            anomalyLevel =
                "High";

        }

        else if (
            anomalies.some(
                item =>
                    item.severity === "Medium"
            )
        ) {

            anomalyLevel =
                "Medium";

        }


        res.json({

            success: true,

            businessName:
                business.businessName,

            anomalyLevel:
                anomalyLevel,

            anomalyCount:
                anomalies.length,

            anomalies:
                anomalies,

            message:

                anomalies.length > 0

                    ? "Unusual financial business patterns detected."

                    : "No major financial anomalies detected."

        });


    } catch (error) {

        console.error(
            "Anomaly Detection Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Anomaly detection failed",

            error:
                error.message

        });

    }

});


// =====================================================
// AI RECOMMENDATION ENGINE
// =====================================================

router.get("/:id/recommendations", async (req, res) => {

    try {

        const business =
            await Business.findById(
                req.params.id
            );


        if (!business) {

            return res.status(404).json({

                success: false,

                message:
                    "Business not found"

            });

        }


        const revenue =
            Number(
                business.monthlyRevenue || 0
            );

        const expenses =
            Number(
                business.monthlyExpenses || 0
            );

          const analysis =
    calculateRisk({

        businessName:
            business.businessName,

        category:
            business.category,

        location:
            business.location,

        monthlyRevenue:
            revenue,

        monthlyExpenses:
            expenses,

        monthlyProfit:
            revenue - expenses

    });
        


        return res.json({

            success: true,

            businessName:
                business.businessName,

            recommendations:
    analysis.recommendationActions || []

        });


    } catch (error) {

        console.error(
            "Recommendation Error:",
            error.message
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to generate recommendations"

        });

    }

});


// =====================================================
// AGENTIC AI BUSINESS MONITOR + AUTOMATIC REPORT
// =====================================================

router.get("/:id/agentic-report", async (req, res) => {

    try {

        const business =
            await Business.findById(
                req.params.id
            );


        if (!business) {

            return res.status(404).json({

                success: false,

                message:
                    "Business not found"

            });

        }


        // ---------------------------------------------
        // AGENT 1: Risk Analysis
        // ---------------------------------------------

        const revenue =
            Number(
                business.monthlyRevenue || 0
            );

        const expenses =
            Number(
                business.monthlyExpenses || 0
            );


        const aiData = {

            businessName:
                business.businessName,

            category:
                business.category,

            location:
                business.location,

            monthlyRevenue:
                revenue,

            monthlyExpenses:
                expenses,

            monthlyProfit:
                revenue - expenses

        };

            const analysis =
    calculateRisk(aiData);
        


        // ---------------------------------------------
        // AGENT 2: Detect Financial Anomalies
        // ---------------------------------------------

        const anomalies = [];


        if (
            expenses > revenue
        ) {

            anomalies.push(
                "Expenses are higher than revenue."
            );

        }


        if (
            revenue > 0 &&
            expenses >= revenue * 0.8 &&
            expenses <= revenue
        ) {

            anomalies.push(
                "Expenses are very high compared with revenue."
            );

        }


        // ---------------------------------------------
        // AGENT 3: Generate Actions
        // ---------------------------------------------

        const actions = [];


        if (
            expenses > revenue
        ) {

            actions.push(
                "Review expenses and reduce unnecessary costs."
            );

        }

        else if (
            revenue > 0 &&
            expenses >= revenue * 0.8
        ) {

            actions.push(
                "Monitor expenses closely before they affect profitability."
            );

        }


        if (
            actions.length === 0
        ) {

            actions.push(
                "Continue monitoring revenue and expenses regularly."
            );

        }


        // ---------------------------------------------
        // AGENT 4: Determine Priority
        // ---------------------------------------------

        let priority =
            "Low";


        const riskScore =
            Number(

                analysis.overallRiskScore ||
                business.overallRiskScore ||
                0

            );


        if (
            riskScore >= 75
        ) {

            priority =
                "Critical";

        }

        else if (
            riskScore >= 50
        ) {

            priority =
                "High";

        }

        else if (
            riskScore >= 25
        ) {

            priority =
                "Medium";

        }


        // ---------------------------------------------
        // AGENT 5: Automatic Report
        // ---------------------------------------------

        const report = {

            businessName:
                business.businessName,

            category:
                business.category,

            location:
                business.location,

            generatedAt:
                new Date(),

            revenue:
                revenue,

            expenses:
                expenses,

            profit:
                revenue - expenses,

            riskScore:
                riskScore,

            riskLevel:
                analysis.riskLevel ||
                business.riskLevel ||
                "Not analyzed",

            priority:
                priority,

            aiPrediction:
                analysis.aiPrediction ||
                business.aiPrediction ||
                "No prediction available.",

            detectedAnomalies:
                anomalies,

            recommendedActions:
                actions,

            detectedRisks:
                analysis.detectedRisks ||
                [],

            aiRecommendations:
                analysis.recommendations ||
                [],

            metrics:
                analysis.metrics ||
                {}

        };


        // ---------------------------------------------
        // Send Agentic Report
        // ---------------------------------------------

        res.json({

            success: true,

            message:
                "Agentic AI business monitoring completed.",

            agentStatus:
                "Completed",

            report:
                report

        });


    } catch (error) {

        console.error(
            "Agentic AI Report Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Agentic AI report generation failed",

            error:
                error.message

        });

    }

});
// =====================================================
// AI BUSINESS IMPACT SIMULATION ENGINE
// =====================================================

router.post("/:id/impact-simulation", async (req, res) => {

    try {

        const business =
            await Business.findById(req.params.id);

        if (!business) {

            return res.status(404).json({

                success: false,

                message: "Business not found"

            });

        }


        // -------------------------------------------------
        // Current Business Data
        // -------------------------------------------------

        const currentRevenue =
            Number(business.monthlyRevenue || 0);

        const currentExpenses =
            Number(business.monthlyExpenses || 0);

        const currentProfit =
            currentRevenue - currentExpenses;


        if (currentRevenue <= 0) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid business revenue is required for impact simulation."

            });

        }


        // -------------------------------------------------
        // Scenario Inputs
        // -------------------------------------------------

        const revenueChange =
            Number(req.body.revenueChangePercent || 0);

        const expenseChange =
            Number(req.body.expenseChangePercent || 0);


        if (
            !Number.isFinite(revenueChange) ||
            !Number.isFinite(expenseChange)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Revenue and expense change values must be valid numbers."

            });

        }


        // -------------------------------------------------
        // Simulated Business Condition
        // -------------------------------------------------

        const simulatedRevenue =
            currentRevenue +
            (currentRevenue * revenueChange / 100);

        const simulatedExpenses =
            currentExpenses +
            (currentExpenses * expenseChange / 100);

        const simulatedProfit =
            simulatedRevenue - simulatedExpenses;


        // -------------------------------------------------
        // Current AI Risk
        // -------------------------------------------------

        const currentAnalysis =
            calculateRisk({

                businessName:
                    business.businessName,

                category:
                    business.category,

                location:
                    business.location,

                monthlyRevenue:
                    currentRevenue,

                monthlyExpenses:
                    currentExpenses,

                monthlyProfit:
                    currentProfit

            });


        // -------------------------------------------------
        // Simulated AI Risk
        // -------------------------------------------------

        const simulatedAnalysis =
            calculateRisk({

                businessName:
                    business.businessName,

                category:
                    business.category,

                location:
                    business.location,

                monthlyRevenue:
                    simulatedRevenue,

                monthlyExpenses:
                    simulatedExpenses,

                monthlyProfit:
                    simulatedProfit

            });


        const currentRiskScore =
            Number(
                currentAnalysis.overallRiskScore || 0
            );

        const simulatedRiskScore =
            Number(
                simulatedAnalysis.overallRiskScore || 0
            );


        // -------------------------------------------------
        // Impact Chain
        // -------------------------------------------------

        const impactChain = [];


        if (revenueChange !== 0) {

            impactChain.push({

                stage: "Revenue Impact",

                change:
                    `${revenueChange}%`,

                result:
                    revenueChange < 0
                        ? "Revenue decreases"
                        : "Revenue increases"

            });

        }


        if (expenseChange !== 0) {

            impactChain.push({

                stage: "Expense Impact",

                change:
                    `${expenseChange}%`,

                result:
                    expenseChange > 0
                        ? "Operating expenses increase"
                        : "Operating expenses decrease"

            });

        }


        impactChain.push({

            stage: "Profit Impact",

            currentProfit:
                currentProfit,

            simulatedProfit:
                simulatedProfit,

            result:
                simulatedProfit < currentProfit
                    ? "Profit decreases"
                    : simulatedProfit > currentProfit
                        ? "Profit improves"
                        : "Profit remains similar"

        });


        impactChain.push({

            stage: "Risk Impact",

            currentRiskScore:
                currentRiskScore,

            simulatedRiskScore:
                simulatedRiskScore,

            result:
                simulatedRiskScore > currentRiskScore
                    ? "Business risk increases"
                    : simulatedRiskScore < currentRiskScore
                        ? "Business risk decreases"
                        : "Business risk remains similar"

        });


        // -------------------------------------------------
        // Final Decision Impact
        // -------------------------------------------------

        let decisionImpact =
            "The simulated decision produces a similar business condition.";

        if (
            simulatedRiskScore >
            currentRiskScore
        ) {

            decisionImpact =
                "The simulated decision may increase business risk.";

        }

        else if (
            simulatedRiskScore <
            currentRiskScore
        ) {

            decisionImpact =
                "The simulated decision may reduce business risk.";

        }


        // -------------------------------------------------
        // Response
        // -------------------------------------------------

        res.json({

            success: true,

            engine:
                "AI Business Impact Simulation Engine",

            business: {

                name:
                    business.businessName,

                category:
                    business.category,

                location:
                    business.location

            },

            currentCondition: {

                revenue:
                    currentRevenue,

                expenses:
                    currentExpenses,

                profit:
                    currentProfit,

                riskScore:
                    currentRiskScore,

                riskLevel:
                    currentAnalysis.riskLevel ||
                    "Not analyzed"

            },

            simulatedCondition: {

                revenue:
                    Number(
                        simulatedRevenue.toFixed(2)
                    ),

                expenses:
                    Number(
                        simulatedExpenses.toFixed(2)
                    ),

                profit:
                    Number(
                        simulatedProfit.toFixed(2)
                    ),

                riskScore:
                    simulatedRiskScore,

                riskLevel:
                    simulatedAnalysis.riskLevel ||
                    "Not analyzed"

            },

            scenario: {

                revenueChangePercent:
                    revenueChange,

                expenseChangePercent:
                    expenseChange

            },

            impactChain:
                impactChain,

            decisionImpact:
                decisionImpact,

            recommendation:
                simulatedRiskScore > currentRiskScore
                    ? "Consider reducing expenses or improving revenue before implementing this decision."
                    : "The simulated condition does not show an increase in overall business risk."

        });

    } catch (error) {

        console.error(
            "AI Business Impact Simulation Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Business impact simulation failed",

            error:
                error.message

        });

    }

});
// ==========================================
// ADVANCED BUSINESS DATA
// UPDATE TODAY'S SALES & CUSTOMER COUNT
// ==========================================
router.put("/:id/advanced-data", async (req, res) => {
    try {
        const { todaysSales, customerCount } = req.body;

        const business = await Business.findById(req.params.id);

        if (!business) {
            return res.status(404).json({
                message: "Business not found"
            });
        }

        if (todaysSales !== undefined) {
            business.todaysSales = Number(todaysSales);
        }

        if (customerCount !== undefined) {
            business.customerCount = Number(customerCount);
        }

        await business.save();

        res.json({
    success: true,
    message: "Advanced business data updated successfully",
    business
});

    } catch (error) {
        console.error("Advanced data update error:", error);

        res.status(500).json({
            message: "Failed to update advanced business data",
            error: error.message
        });
    }
});


// ==========================================
// GET RISK ANALYSIS HISTORY
// ==========================================
router.get("/:id/risk-history", async (req, res) => {
    try {
        const business = await Business.findById(req.params.id);

        if (!business) {
            return res.status(404).json({
                message: "Business not found"
            });
        }

        res.json({
            businessName: business.businessName,
            history: (business.riskAnalysisHistory || []).slice(-10)
        });

    } catch (error) {
        console.error("Risk history error:", error);

        res.status(500).json({
            message: "Failed to load risk analysis history",
            error: error.message
        });
    }
});

module.exports = router;
