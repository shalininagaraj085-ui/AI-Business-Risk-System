const express = require("express");

const Business = require("./businessModel");
const { calculateRisk } = require("./riskEngine");

const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

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
// SMART UNIVERSAL AI BUSINESS COPILOT
// =====================================================

async function generateCopilotAnswer(question, business) {
    try {
        const originalQuestion = String(question || "").trim();

        const revenue = Number(business.monthlyRevenue || 0);
        const expenses = Number(business.monthlyExpenses || 0);

        const profit = revenue - expenses;

        const expenseRatio =
            revenue > 0
                ? (expenses / revenue) * 100
                : 0;

        const profitMargin =
            revenue > 0
                ? (profit / revenue) * 100
                : 0;

        // Get all available business data
        const businessData =
            business.toObject
                ? business.toObject()
                : { ...business };

        // Remove internal MongoDB fields
        delete businessData._id;
        delete businessData.__v;
        delete businessData.createdAt;
        delete businessData.updatedAt;

        // Add calculated financial information
        businessData.calculatedMetrics = {
            monthlyProfit: profit,
            expenseRatio: Number(expenseRatio.toFixed(2)),
            profitMargin: Number(profitMargin.toFixed(2))
        };

        const aiResponse =
            await openai.responses.create({
                model: "gpt-5.6-luna",

                instructions: `
You are an AI Business Copilot for a Business Risk Management System.

Your job is to answer the user's question accurately using the selected business data.

IMPORTANT RULES:

1. Understand natural-language questions.
2. Understand different ways of asking the same question.
3. Use the selected business data whenever the question is related to that business.
4. You may calculate values such as:
   - profit
   - loss
   - expense ratio
   - profit margin
   - differences
   - percentages
5. Do NOT invent information.
6. Do NOT assume missing values.
7. If the requested information is not available in the business data, clearly say:
   "That information is not available in the current business data."
8. Explain risk score and risk level when the user asks about risk.
9. Explain AI prediction when the user asks about future risk or prediction.
10. If the user asks for recommendations, give practical recommendations based on the available data.
11. If the user asks a comparison, compare only values that are actually available.
12. If the user asks a question in Tamil or Tanglish, answer in the same language when possible.
13. If the user asks a normal business question, answer directly without saying that you are an AI.
14. Keep answers clear and suitable for a college project demonstration.
15. Do not claim real-time information that is not present in the supplied data.
16. Never make up customers, sales, inventory, suppliers, market conditions, dates, or financial values.

Selected Business Data:
${JSON.stringify(businessData, null, 2)}

User Question:
${originalQuestion}
                `,

                input: originalQuestion
            });

        const answer =
            aiResponse.output_text?.trim();

        if (answer) {
            return answer;
        }

        return "I could not generate an answer from the available business data.";

    } catch (error) {

        console.error(
            "AI Copilot Error:",
            error
        );

        if (
            error.status === 429 ||
            error.code === "insufficient_quota"
        ) {
            return `
🤖 AI Business Copilot

The OpenAI API quota or credits are unavailable right now.
Please check your OpenAI API billing/credits and try again.
            `.trim();
        }

        return `
🤖 AI Business Copilot

I could not generate the AI answer right now.
Please try again.
        `.trim();
    }
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


module.exports = router;
