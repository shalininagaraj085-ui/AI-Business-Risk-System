function calculateRisk(data) {
    const revenue = Number(data.monthlyRevenue || 0);
    const expenses = Number(data.monthlyExpenses || 0);
    const profit = revenue - expenses;

    let expenseRatio = 0;
    let profitMargin = 0;

    if (revenue > 0) {
        expenseRatio = (expenses / revenue) * 100;
        profitMargin = (profit / revenue) * 100;
    }

    // -----------------------------
    // FINANCIAL RISK SCORE
    // -----------------------------
    let financialScore = 0;

    if (revenue <= 0) {
        financialScore += 40;
    }

    if (expenseRatio >= 100) {
        financialScore += 40;
    } else if (expenseRatio >= 80) {
        financialScore += 30;
    } else if (expenseRatio >= 60) {
        financialScore += 15;
    }

    if (profit < 0) {
        financialScore += 20;
    } else if (profitMargin < 10) {
        financialScore += 10;
    }

    financialScore = Math.min(100, financialScore);

    // -----------------------------
    // RISK LEVEL
    // -----------------------------
    let riskLevel = "Low";

    if (financialScore >= 75) {
        riskLevel = "Critical";
    } else if (financialScore >= 50) {
        riskLevel = "High";
    } else if (financialScore >= 25) {
        riskLevel = "Medium";
    }

    // -----------------------------
    // DETECTED RISKS
    // -----------------------------
    const detectedRisks = [];

    if (revenue <= 0) {
        detectedRisks.push("Revenue is unavailable or zero.");
    }

    if (expenses > revenue && revenue > 0) {
        detectedRisks.push("Expenses are higher than revenue.");
    } else if (expenseRatio >= 80) {
        detectedRisks.push("Expenses are very high compared with revenue.");
    }

    if (profit < 0) {
        detectedRisks.push("Business is operating at a loss.");
    }

    if (profit >= 0 && profitMargin < 10 && revenue > 0) {
        detectedRisks.push("Profit margin is low.");
    }

    // -----------------------------
    // ANOMALIES
    // -----------------------------
    const anomalies = [];

    if (expenses > revenue && revenue > 0) {
        anomalies.push({
            type: "Financial",
            severity: "High",
            message: "Expenses are higher than revenue."
        });
    } else if (expenseRatio >= 80) {
        anomalies.push({
            type: "Financial",
            severity: "Medium",
            message: "Expenses are very high compared with revenue."
        });
    }

    if (profit < 0) {
        anomalies.push({
            type: "Profit",
            severity: "High",
            message: "Negative monthly profit detected."
        });
    }

    // -----------------------------
    // RECOMMENDATIONS
    // -----------------------------
    const recommendations = [];
    const recommendationActions = [];

    if (expenses > revenue && revenue > 0) {
        recommendations.push(
            "Reduce unnecessary operating expenses immediately."
        );

        recommendationActions.push({
            priority: "High",
            action: "Reduce unnecessary expenses",
            reason: "Expenses are higher than revenue."
        });
    } else if (expenseRatio >= 80) {
        recommendations.push(
            "Closely monitor and reduce high operating expenses."
        );

        recommendationActions.push({
            priority: "Medium",
            action: "Control operating expenses",
            reason: "Expenses consume a high percentage of revenue."
        });
    }

    if (profit < 0) {
        recommendations.push(
            "Improve profitability by increasing revenue or reducing expenses."
        );

        recommendationActions.push({
            priority: "High",
            action: "Improve profitability",
            reason: "Monthly profit is negative."
        });
    }

    if (revenue > 0 && profitMargin >= 10) {
        recommendations.push(
            "Continue monitoring financial performance and maintain the current margin."
        );

        recommendationActions.push({
            priority: "Low",
            action: "Maintain financial discipline",
            reason: "Current profit margin is positive."
        });
    }

    if (recommendations.length === 0) {
        recommendations.push(
            "Continue monitoring revenue, expenses and profitability."
        );

        recommendationActions.push({
            priority: "Low",
            action: "Continue monitoring",
            reason: "No major financial risk detected."
        });
    }

    // -----------------------------
    // EARLY WARNINGS
    // -----------------------------
    const earlyWarnings = [];

    if (expenseRatio >= 80) {
        earlyWarnings.push(
            "Expense-to-revenue ratio is reaching a risky level."
        );
    }

    if (profit < 0) {
        earlyWarnings.push(
            "Negative profit may create future financial pressure."
        );
    }

    if (revenue <= 0) {
        earlyWarnings.push(
            "Revenue data is unavailable for reliable financial prediction."
        );
    }

    // -----------------------------
    // FUTURE RISK
    // -----------------------------
    let futureScore = financialScore;

    if (expenseRatio >= 80) {
        futureScore = Math.min(100, futureScore + 10);
    }

    if (profit < 0) {
        futureScore = Math.min(100, futureScore + 10);
    }

    let futureRiskLevel = "Low";

    if (futureScore >= 75) {
        futureRiskLevel = "Critical";
    } else if (futureScore >= 50) {
        futureRiskLevel = "High";
    } else if (futureScore >= 25) {
        futureRiskLevel = "Medium";
    }

    let futurePrediction =
        "Business financial condition should be monitored continuously.";

    if (futureRiskLevel === "Critical") {
        futurePrediction =
            "Future financial risk may become critical if the current trend continues.";
    } else if (futureRiskLevel === "High") {
        futurePrediction =
            "Future financial pressure may increase if expenses remain high.";
    } else if (futureRiskLevel === "Medium") {
        futurePrediction =
            "Some financial pressure may develop if current conditions continue.";
    } else {
        futurePrediction =
            "Future financial condition appears relatively stable based on available data.";
    }

    // -----------------------------
    // AI PREDICTION
    // -----------------------------
    let aiPrediction =
        "Business financial condition is relatively stable.";

    if (riskLevel === "Critical") {
        aiPrediction =
            "Critical financial risk detected. Immediate corrective action is recommended.";
    } else if (riskLevel === "High") {
        aiPrediction =
            "High financial risk detected. Business expenses and profitability require immediate attention.";
    } else if (riskLevel === "Medium") {
        aiPrediction =
            "Moderate financial risk detected. Continuous monitoring and expense control are recommended.";
    }

    // -----------------------------
    // FINAL RESULT
    // -----------------------------
    return {
        overallRiskScore: financialScore,
        riskLevel,
        aiPrediction,

        detectedRisks: [
            ...new Set(detectedRisks)
        ],

        recommendations: [
            ...new Set(recommendations)
        ],

        anomalies: [
            ...new Map(
                anomalies.map(item => [
                    `${item.type}-${item.message}`,
                    item
                ])
            ).values()
        ],

        recommendationActions,

        earlyWarnings: [
            ...new Set(earlyWarnings)
        ],

        futureRisk: {
            score: futureScore,
            riskLevel: futureRiskLevel,
            prediction: futurePrediction
        },

        metrics: {
            financialScore,
            expenseRatio: Number(expenseRatio.toFixed(2)),
            profitMargin: Number(profitMargin.toFixed(2)),
            monthlyRevenue: Number(revenue.toFixed(2)),
            monthlyExpenses: Number(expenses.toFixed(2)),
            monthlyProfit: Number(profit.toFixed(2)),
            currentRiskScore: financialScore,
            futureRiskScore: futureScore
        }
    };
}

module.exports = {
    calculateRisk
};
