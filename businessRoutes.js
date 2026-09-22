const express = require("express");
const axios = require("axios");
const Business = require("./businessModel");

const router = express.Router();

const AI_API_URL =
    process.env.AI_API_URL ||
    "http://127.0.0.1:8000/api/risk/analyze";

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
            generateCopilotAnswer(
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
// SMART UNIVERSAL AI BUSINESS COPILOT
// =====================================================

function generateCopilotAnswer(question, business) {

    const originalQuestion =
        String(question || "").trim();

    const q =
        originalQuestion
            .toLowerCase()
            .replace(/[?!.,'"]/g, " ")
            .replace(/\s+/g, " ")
            .trim();


    // =================================================
    // BUSINESS DATA
    // =================================================

    const businessName =
        business.businessName || "Selected Business";

    const category =
        business.category || "Not available";

    const location =
        business.location || "Not available";

    const revenue =
        Number(business.monthlyRevenue || 0);

    const expenses =
        Number(business.monthlyExpenses || 0);

    const profit =
        revenue - expenses;

    const expenseRatio =
        revenue > 0
            ? (expenses / revenue) * 100
            : 0;

    const profitMargin =
        revenue > 0
            ? (profit / revenue) * 100
            : 0;

    const riskScore =
        Number(business.overallRiskScore || 0);

    const riskLevel =
        business.riskLevel || "Not analyzed";

    const prediction =
        business.aiPrediction ||
        "No prediction available.";


    // =================================================
    // FINANCIAL STATUS
    // =================================================

    let financialStatus;

    if (revenue <= 0) {

        financialStatus =
            "Valid revenue data is not available.";

    } else if (expenses > revenue) {

        financialStatus =
            "Expenses are higher than revenue, resulting in an estimated loss.";

    } else if (expenseRatio >= 80) {

        financialStatus =
            "The business is profitable, but expenses are consuming a very high portion of revenue.";

    } else if (expenseRatio >= 60) {

        financialStatus =
            "The business is profitable, but expenses require regular monitoring.";

    } else {

        financialStatus =
            "Revenue is currently higher than expenses, producing a positive estimated profit.";

    }


    // =================================================
    // 1. GREETING
    // =================================================

    if (
        /^(hi|hello|hey|good morning|good afternoon|good evening)$/.test(q)
    ) {

        return `
👋 Hello!

I am your AI Business Assistant.

Selected Business:
${businessName}

I can help you understand:

• Current financial condition
• Revenue
• Expenses
• Profit
• Risk
• Future risk
• Business problems
• Reasons behind risk
• Recommendations
• Business information

Ask me any question about ${businessName}.
        `.trim();
    }


    // =================================================
    // 2. EXACT BUSINESS NAME
    // =================================================

    if (
        q === "what is the business name" ||
        q === "business name" ||
        q === "name of business" ||
        q === "what business is this"
    ) {

        return `
🏢 Business Name

${businessName}
        `.trim();
    }


    // =================================================
    // 3. CATEGORY
    // =================================================

    if (
        q === "category" ||
        q === "business category" ||
        q === "what is the category" ||
        q === "what type of business is this"
    ) {

        return `
📂 Business Category

${category}
        `.trim();
    }


    // =================================================
    // 4. LOCATION
    // =================================================

    if (
        q === "location" ||
        q === "business location" ||
        q === "where is the business" ||
        q === "where is this business located"
    ) {

        return `
📍 Business Location

${location}
        `.trim();
    }


    // =================================================
    // 5. REVENUE
    // =================================================

    if (
        q.includes("monthly revenue") ||
        q.includes("revenue") ||
        q.includes("income") ||
        q.includes("earnings") ||
        q === "how much does the business earn"
    ) {

        return `
💰 Revenue Analysis

Business:
${businessName}

Monthly Revenue:
₹${revenue.toLocaleString("en-IN")}

Monthly Expenses:
₹${expenses.toLocaleString("en-IN")}

Estimated Monthly Profit:
₹${profit.toLocaleString("en-IN")}

Profit Margin:
${profitMargin.toFixed(2)}%

The revenue shown here comes from the latest saved business data.
        `.trim();
    }


    // =================================================
    // 6. EXPENSES
    // =================================================

    if (
        q.includes("monthly expense") ||
        q.includes("expenses") ||
        q.includes("expense") ||
        q.includes("cost") ||
        q.includes("spending")
    ) {

        return `
💸 Expense Analysis

Business:
${businessName}

Monthly Expenses:
₹${expenses.toLocaleString("en-IN")}

Monthly Revenue:
₹${revenue.toLocaleString("en-IN")}

Expense Ratio:
${expenseRatio.toFixed(2)}%

Estimated Profit:
₹${profit.toLocaleString("en-IN")}

Assessment:
${financialStatus}
        `.trim();
    }


    // =================================================
    // 7. PROFIT
    // =================================================

    if (
        q.includes("profit") ||
        q.includes("profitability") ||
        q.includes("profit margin") ||
        q.includes("loss")
    ) {

        let status;

        if (profit > 0) {

            status =
                "The business currently has a positive estimated monthly profit.";

        } else if (profit < 0) {

            status =
                "The business currently has an estimated monthly loss.";

        } else {

            status =
                "Revenue and expenses are currently equal.";

        }

        return `
📊 Profitability Analysis

Business:
${businessName}

Revenue:
₹${revenue.toLocaleString("en-IN")}

Expenses:
₹${expenses.toLocaleString("en-IN")}

Estimated Profit:
₹${profit.toLocaleString("en-IN")}

Profit Margin:
${profitMargin.toFixed(2)}%

Status:
${status}
        `.trim();
    }


    // =================================================
    // 8. RISK SCORE ONLY
    // =================================================

    if (
        q.includes("risk score") ||
        q === "risk"
    ) {

        return `
⚠️ Current Risk

Business:
${businessName}

Risk Score:
${riskScore}

Risk Level:
${riskLevel}

The risk score is based on the latest analyzed business data.
        `.trim();
    }


    // =================================================
    // 9. RISK LEVEL
    // =================================================

    if (
        q.includes("risk level") ||
        q.includes("how risky") ||
        q.includes("is this business risky")
    ) {

        return `
⚠️ Risk Level

Business:
${businessName}

Current Risk Level:
${riskLevel}

Risk Score:
${riskScore}

AI Assessment:
${getRiskExplanation(riskScore)}
        `.trim();
    }


    // =================================================
    // 10. PROBLEM / ERROR
    // =================================================

    if (
        q.includes("problem") ||
        q.includes("problems") ||
        q.includes("issue") ||
        q.includes("issues") ||
        q.includes("error") ||
        q.includes("what is wrong") ||
        q.includes("what went wrong")
    ) {

        let problem;

        if (revenue <= 0) {

            problem =
                "Valid revenue data is not available.";

        } else if (expenses > revenue) {

            problem =
                "Expenses are higher than revenue, creating an estimated loss.";

        } else if (expenseRatio >= 80) {

            problem =
                "Expenses are consuming a very high portion of revenue.";

        } else if (expenseRatio >= 60) {

            problem =
                "Operating expenses are relatively high and should be monitored.";

        } else {

            problem =
                "No major financial problem is visible from the current saved data.";

        }

        return `
🚨 Business Problem Analysis

Business:
${businessName}

Detected Problem:
${problem}

Revenue:
₹${revenue.toLocaleString("en-IN")}

Expenses:
₹${expenses.toLocaleString("en-IN")}

Estimated Profit:
₹${profit.toLocaleString("en-IN")}

Current Risk:
${riskScore} — ${riskLevel}
        `.trim();
    }


    // =================================================
    // 11. WHY / REASON
    // =================================================

    if (
        q.includes("why") ||
        q.includes("reason") ||
        q.includes("because") ||
        q.includes("explain")
    ) {

        let reason;

        if (revenue <= 0) {

            reason =
                "Revenue data is unavailable, so the financial condition cannot be evaluated reliably.";

        } else if (expenses > revenue) {

            reason =
                "Expenses are higher than revenue, creating an estimated loss.";

        } else if (expenseRatio >= 80) {

            reason =
                "Expenses consume a large portion of revenue, reducing the available profit margin.";

        } else if (expenseRatio >= 60) {

            reason =
                "Expenses represent a significant portion of revenue.";

        } else {

            reason =
                "Revenue is currently higher than expenses, resulting in a positive estimated profit.";

        }

        return `
🧠 AI Explanation

Business:
${businessName}

Why:
${reason}

Revenue:
₹${revenue.toLocaleString("en-IN")}

Expenses:
₹${expenses.toLocaleString("en-IN")}

Profit:
₹${profit.toLocaleString("en-IN")}

Risk:
${riskScore} — ${riskLevel}
        `.trim();
    }


    // =================================================
    // 12. FUTURE / PREDICTION
    // =================================================

    if (
        q.includes("future") ||
        q.includes("predict") ||
        q.includes("prediction") ||
        q.includes("next month") ||
        q.includes("upcoming") ||
        q.includes("what will happen")
    ) {

        return `
🔮 Future Business Risk Prediction

Business:
${businessName}

Current Risk Score:
${riskScore}

Current Risk Level:
${riskLevel}

Current Revenue:
₹${revenue.toLocaleString("en-IN")}

Current Expenses:
₹${expenses.toLocaleString("en-IN")}

Current Profit:
₹${profit.toLocaleString("en-IN")}

AI Future Prediction:
${prediction}

This is an AI-based prediction using the currently saved business data. It is not a guaranteed future result.
        `.trim();
    }


    // =================================================
    // 13. RECOMMENDATION
    // =================================================

    if (
        q.includes("recommend") ||
        q.includes("suggest") ||
        q.includes("advice") ||
        q.includes("what should i do") ||
        q.includes("what should we do") ||
        q.includes("how can i improve") ||
        q.includes("what action")
    ) {

        let recommendation;

        if (revenue <= 0) {

            recommendation =
                "Enter valid revenue data so the AI can monitor the financial condition correctly.";

        } else if (expenses > revenue) {

            recommendation =
                "Review expenses immediately, reduce unnecessary costs and work on improving revenue.";

        } else if (expenseRatio >= 80) {

            recommendation =
                "Control unnecessary expenses and improve the revenue-to-expense gap.";

        } else if (expenseRatio >= 60) {

            recommendation =
                "Continue monitoring expenses and protect the current profit margin.";

        } else {

            recommendation =
                "Continue monitoring revenue and expenses and maintain the current financial gap.";

        }

        return `
💡 AI Business Recommendation

Business:
${businessName}

Recommended Action:
${recommendation}

Current Risk:
${riskScore} — ${riskLevel}

Revenue:
₹${revenue.toLocaleString("en-IN")}

Expenses:
₹${expenses.toLocaleString("en-IN")}

Estimated Profit:
₹${profit.toLocaleString("en-IN")}
        `.trim();
    }


    // =================================================
    // 14. FINANCIAL CONDITION
    // =================================================

    if (
        q.includes("financial condition") ||
        q.includes("financial health") ||
        q.includes("business health") ||
        q.includes("overall condition") ||
        q.includes("how is the business doing") ||
        q.includes("business performance")
    ) {

        return `
📈 Overall Business Condition

Business:
${businessName}

Revenue:
₹${revenue.toLocaleString("en-IN")}

Expenses:
₹${expenses.toLocaleString("en-IN")}

Estimated Profit:
₹${profit.toLocaleString("en-IN")}

Expense Ratio:
${expenseRatio.toFixed(2)}%

Profit Margin:
${profitMargin.toFixed(2)}%

Risk:
${riskScore} — ${riskLevel}

AI Assessment:
${financialStatus}

AI Prediction:
${prediction}
        `.trim();
    }


    // =================================================
    // 15. SUMMARY
    // =================================================

    if (
        q.includes("summary") ||
        q.includes("summarize") ||
        q.includes("overview") ||
        q.includes("complete details") ||
        q.includes("all details") ||
        q.includes("everything") ||
        q.includes("tell me about this business") ||
        q.includes("about this business")
    ) {

        return `
🤖 AI Business Summary

Business:
${businessName}

Category:
${category}

Location:
${location}

Monthly Revenue:
₹${revenue.toLocaleString("en-IN")}

Monthly Expenses:
₹${expenses.toLocaleString("en-IN")}

Estimated Monthly Profit:
₹${profit.toLocaleString("en-IN")}

Expense Ratio:
${expenseRatio.toFixed(2)}%

Profit Margin:
${profitMargin.toFixed(2)}%

Current Risk:
${riskScore} — ${riskLevel}

AI Prediction:
${prediction}

AI Assessment:
${financialStatus}
        `.trim();
    }


    // =================================================
    // 16. UNKNOWN QUESTION
    // =================================================
    // Instead of giving the same generic answer,
    // clearly tell the user that this exact question
    // is outside the currently available business data.

    return `
🤖 AI Business Assistant

Your Question:
${originalQuestion}

I can currently analyze this selected business using its saved data.

Available information:
• Business Name
• Category
• Location
• Revenue
• Expenses
• Estimated Profit
• Profit Margin
• Current Risk
• Risk Level
• Future Risk Prediction
• Business Problems
• AI Recommendations

For questions outside these areas, additional business data or a dedicated AI model would be required.

Selected Business:
${businessName}
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
        // 3. Send data to Python AI
        // ---------------------------------------------

        console.log(
            `🤖 Sending ${business.businessName} financial data to AI...`
        );


        const aiResponse =
            await axios.post(

                AI_API_URL,

                aiData,

                {
                    timeout: 10000
                }

            );


        // ---------------------------------------------
        // 4. Get AI result
        // ---------------------------------------------

        const analysis =
            aiResponse.data.analysis || {};


        // ---------------------------------------------
        // 5. Save AI result
        // ---------------------------------------------

        business.overallRiskScore =
            analysis.overallRiskScore || 0;

        business.riskLevel =
            analysis.riskLevel || "Not analyzed";

        business.aiPrediction =
            analysis.aiPrediction ||
            "No prediction available.";

        business.lastRiskAnalysis =
            new Date();


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


        if (
            error.code === "ECONNREFUSED"
        ) {

            return res.status(503).json({

                success: false,

                message:
                    "AI server is not running. Start Python AI server on port 8000."

            });

        }


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


        const response =
            await axios.post(

                AI_API_URL,

                {

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

                }

            );


        return res.json({

            success: true,

            businessName:
                business.businessName,

            recommendations:
                response.data.analysis
                    ?.recommendationActions || []

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


        const aiResponse =
            await axios.post(

                AI_API_URL,

                aiData,

                {
                    timeout: 10000
                }

            );


        const analysis =
            aiResponse.data.analysis || {};


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


        if (
            error.code === "ECONNREFUSED"
        ) {

            return res.status(503).json({

                success: false,

                message:
                    "AI server is not running. Start Python AI server on port 8000."

            });

        }


        res.status(500).json({

            success: false,

            message:
                "Agentic AI report generation failed",

            error:
                error.message

        });

    }

});


module.exports = router;
