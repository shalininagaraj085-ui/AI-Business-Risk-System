def calculate_risk(data):
    """
    AI-Powered Business Risk Prediction Engine

    Universal business risk analysis based on:
    - Monthly Revenue
    - Monthly Expenses
    - Monthly Profit
    - Expense-to-Revenue Ratio

    The engine does not require business-specific inputs such as
    sales, customers, inventory, suppliers or cash balance.
    """

    risks = []
    recommendations = []
    anomalies = []
    recommendation_actions = []

    # =================================================
    # 1. BASIC FINANCIAL DATA
    # =================================================

    try:
        revenue = float(data.get("monthlyRevenue", 0) or 0)
    except (ValueError, TypeError):
        revenue = 0

    try:
        expenses = float(data.get("monthlyExpenses", 0) or 0)
    except (ValueError, TypeError):
        expenses = 0

    # Profit can come from backend.
    # If it is not available, calculate it from revenue and expenses.
    try:
        profit = float(
            data.get(
                "monthlyProfit",
                revenue - expenses
            ) or 0
        )
    except (ValueError, TypeError):
        profit = revenue - expenses

    # =================================================
    # 2. FINANCIAL METRICS
    # =================================================

    if revenue > 0:
        expense_ratio = (expenses / revenue) * 100
        profit_margin = (profit / revenue) * 100
    else:
        expense_ratio = 100
        profit_margin = 0

    financial_score = 0

    # =================================================
    # 3. REVENUE VALIDATION / RISK
    # =================================================

    if revenue <= 0:

        financial_score += 45

        risks.append({
            "type": "Revenue Risk",
            "severity": "Critical",
            "reason": "No positive monthly revenue is available for the business."
        })

        recommendations.append(
            "Record valid monthly revenue and review the business income sources."
        )

        anomalies.append({
            "type": "Revenue Anomaly",
            "severity": "Critical",
            "message": "Monthly revenue is zero or unavailable.",
            "value": revenue
        })

    # =================================================
    # 4. EXPENSE RISK
    # =================================================

    if revenue > 0:

        if expense_ratio >= 100:

            financial_score += 40

            risks.append({
                "type": "Financial Risk",
                "severity": "Critical",
                "reason": "Expenses are equal to or higher than monthly revenue."
            })

            recommendations.append(
                "Immediately review operating expenses and reduce unnecessary costs."
            )

            anomalies.append({
                "type": "Expense Anomaly",
                "severity": "Critical",
                "message": "Monthly expenses are equal to or higher than monthly revenue.",
                "value": {
                    "revenue": revenue,
                    "expenses": expenses,
                    "expenseRatio": round(expense_ratio, 2)
                }
            })

        elif expense_ratio >= 90:

            financial_score += 30

            risks.append({
                "type": "Financial Risk",
                "severity": "High",
                "reason": "Expenses consume most of the monthly revenue."
            })

            recommendations.append(
                "Review monthly expenses and identify immediate cost-saving opportunities."
            )

        elif expense_ratio >= 75:

            financial_score += 20

            risks.append({
                "type": "Financial Risk",
                "severity": "Medium",
                "reason": "The expense-to-revenue ratio is relatively high."
            })

            recommendations.append(
                "Monitor operating expenses and improve cost efficiency."
            )

        elif expense_ratio >= 60:

            financial_score += 10

            risks.append({
                "type": "Financial Risk",
                "severity": "Low",
                "reason": "Operating expenses require regular monitoring."
            })

    # =================================================
    # 5. LOSS RISK
    # =================================================

    if profit < 0:

        financial_score += 35

        risks.append({
            "type": "Loss Risk",
            "severity": "Critical",
            "reason": "Monthly expenses are higher than monthly revenue, resulting in a loss."
        })

        recommendations.append(
            "Reduce unnecessary expenses and improve revenue generation."
        )

        anomalies.append({
            "type": "Profit Anomaly",
            "severity": "Critical",
            "message": "The business is currently operating at a monthly loss.",
            "value": round(profit, 2)
        })

    elif profit == 0 and revenue > 0:

        financial_score += 20

        risks.append({
            "type": "Profit Risk",
            "severity": "High",
            "reason": "Revenue is currently only covering monthly expenses."
        })

        recommendations.append(
            "Improve the profit margin by increasing revenue or reducing expenses."
        )

    # =================================================
    # 6. PROFIT MARGIN RISK
    # =================================================

    if revenue > 0:

        if profit_margin < 5 and profit_margin >= 0:

            financial_score += 15

            risks.append({
                "type": "Low Profit Margin Risk",
                "severity": "Medium",
                "reason": "The business has only a small positive profit margin."
            })

            recommendations.append(
                "Improve profit margin through better pricing, revenue growth or cost control."
            )

        elif profit_margin < 10 and profit_margin >= 5:

            financial_score += 8

            risks.append({
                "type": "Profit Margin Risk",
                "severity": "Low",
                "reason": "Profit margin is positive but relatively low."
            })

    # =================================================
    # 7. EARLY WARNING DETECTION
    # =================================================

    early_warnings = []

    if revenue > 0:

        if expense_ratio >= 90:

            early_warnings.append({
                "type": "High Expense Warning",
                "severity": "High",
                "reason": (
                    "Expenses are consuming most of the business revenue. "
                    "If this continues, profitability may decline."
                )
            })

        elif expense_ratio >= 75:

            early_warnings.append({
                "type": "Expense Pressure Warning",
                "severity": "Medium",
                "reason": (
                    "Expenses are relatively high compared with revenue. "
                    "Continuous monitoring is recommended."
                )
            })

        if profit_margin < 10:

            early_warnings.append({
                "type": "Low Profit Margin Warning",
                "severity": "Medium",
                "reason": (
                    "The current profit margin is relatively low. "
                    "A small increase in expenses could create financial pressure."
                )
            })

        if profit < 0:

            early_warnings.append({
                "type": "Loss Warning",
                "severity": "Critical",
                "reason": (
                    "The business is currently operating at a loss. "
                    "Immediate corrective action is recommended."
                )
            })

    # =================================================
    # 8. FUTURE RISK PREDICTION
    # =================================================

    # The future prediction is based on the current financial condition.
    # No fake future business data is generated.

    current_score = min(financial_score, 100)

    # Expected pressure increase based on current condition.
    if expense_ratio >= 100:
        future_score = min(current_score + 10, 100)

    elif expense_ratio >= 90:
        future_score = min(current_score + 8, 100)

    elif expense_ratio >= 75:
        future_score = min(current_score + 5, 100)

    elif profit_margin < 10:
        future_score = min(current_score + 3, 100)

    else:
        future_score = max(current_score - 2, 0)

    future_score = round(future_score)

    if future_score >= 75:
        future_risk_level = "Critical"

    elif future_score >= 50:
        future_risk_level = "High"

    elif future_score >= 25:
        future_risk_level = "Medium"

    else:
        future_risk_level = "Low"

    if future_score > current_score:

        future_prediction = (
            "AI predicts increasing financial risk if the current "
            "revenue and expense condition continues."
        )

    elif future_score < current_score:

        future_prediction = (
            "AI predicts relatively stable or improving financial "
            "conditions if the current performance continues."
        )

    else:

        future_prediction = (
            "AI predicts that the current financial risk condition "
            "may continue if there is no major change in business performance."
        )

    # =================================================
    # 9. CURRENT RISK LEVEL
    # =================================================

    overall_score = min(round(current_score), 100)

    if overall_score >= 75:
        risk_level = "Critical"

    elif overall_score >= 50:
        risk_level = "High"

    elif overall_score >= 25:
        risk_level = "Medium"

    else:
        risk_level = "Low"

    # =================================================
    # 10. CURRENT AI PREDICTION
    # =================================================

    if risk_level == "Critical":

        prediction = (
            "AI predicts a critical financial risk. "
            "Immediate preventive action is recommended."
        )

    elif risk_level == "High":

        prediction = (
            "AI predicts a high business risk based on the current "
            "revenue and expense condition. Preventive action is recommended."
        )

    elif risk_level == "Medium":

        prediction = (
            "AI detects moderate business risk. "
            "The financial condition should be monitored closely."
        )

    else:

        prediction = (
            "AI detects a relatively stable business condition "
            "with low immediate financial risk."
        )

    # =================================================
    # 11. ANOMALY DETECTION
    # =================================================

    if revenue > 0 and expenses > revenue:

        anomalies.append({
            "type": "Financial Anomaly",
            "severity": "High",
            "message": "Monthly expenses are higher than monthly revenue.",
            "value": {
                "revenue": revenue,
                "expenses": expenses
            }
        })

    if revenue > 0 and profit_margin < 5 and profit >= 0:

        anomalies.append({
            "type": "Profit Margin Anomaly",
            "severity": "Medium",
            "message": "Profit margin is very low compared with revenue.",
            "value": round(profit_margin, 2)
        })

    # =================================================
    # 12. RECOMMENDATION ENGINE
    # =================================================

    if expense_ratio >= 90:

        recommendation_actions.append({
            "area": "Financial",
            "priority": "Critical",
            "action": (
                "Review high operating expenses immediately and "
                "reduce unnecessary costs."
            )
        })

    elif expense_ratio >= 75:

        recommendation_actions.append({
            "area": "Financial",
            "priority": "High",
            "action": (
                "Review monthly expenses and identify cost-saving opportunities."
            )
        })

    if profit < 0:

        recommendation_actions.append({
            "area": "Profitability",
            "priority": "Critical",
            "action": (
                "Improve profitability by reducing expenses and "
                "increasing revenue."
            )
        })

    elif profit_margin < 10 and revenue > 0:

        recommendation_actions.append({
            "area": "Profitability",
            "priority": "High",
            "action": (
                "Improve profit margin through revenue growth and "
                "better expense control."
            )
        })

    if revenue <= 0:

        recommendation_actions.append({
            "area": "Revenue",
            "priority": "Critical",
            "action": (
                "Add valid revenue data and review the business income sources."
            )
        })

    if len(recommendation_actions) == 0:

        recommendation_actions.append({
            "area": "General",
            "priority": "Low",
            "action": (
                "Continue monitoring revenue, expenses and profitability regularly."
            )
        })

    # =================================================
    # 13. REMOVE DUPLICATE ANOMALIES
    # =================================================

    unique_anomalies = []

    anomaly_keys = set()

    for anomaly in anomalies:

        key = (
            anomaly.get("type"),
            anomaly.get("message")
        )

        if key not in anomaly_keys:

            anomaly_keys.add(key)
            unique_anomalies.append(anomaly)

    # =================================================
    # 14. RETURN RESULT
    # =================================================

    return {

        "overallRiskScore": overall_score,

        "riskLevel": risk_level,

        "aiPrediction": prediction,

        "detectedRisks": risks,

        "recommendations":
            list(dict.fromkeys(recommendations)),

        "anomalies":
            unique_anomalies,

        "recommendationActions":
            recommendation_actions,

        "earlyWarnings":
            early_warnings,

        "futureRisk": {

            "score": future_score,

            "riskLevel": future_risk_level,

            "prediction": future_prediction

        },

        "metrics": {

            "financialScore": financial_score,

            "expenseRatio":
                round(expense_ratio, 2),

            "profitMargin":
                round(profit_margin, 2),

            "monthlyRevenue":
                round(revenue, 2),

            "monthlyExpenses":
                round(expenses, 2),

            "monthlyProfit":
                round(profit, 2),

            "currentRiskScore":
                overall_score,

            "futureRiskScore":
                future_score

        }
    }


# =====================================================
# TEST
# =====================================================

if __name__ == "__main__":

    sample_business = {

        "businessName":
            "Tech Solutions",

        "category":
            "Technology",

        "location":
            "Salem",

        "monthlyRevenue":
            250000,

        "monthlyExpenses":
            150000,

        "monthlyProfit":
            100000
    }

    result = calculate_risk(sample_business)

    print("\n======================================")
    print(" AI BUSINESS RISK ANALYSIS")
    print("======================================")

    print(
        "Overall Risk Score:",
        result["overallRiskScore"]
    )

    print(
        "Risk Level:",
        result["riskLevel"]
    )

    print(
        "Prediction:",
        result["aiPrediction"]
    )

    print("\nCurrent Financial Metrics:")

    print(
        "Revenue:",
        result["metrics"]["monthlyRevenue"]
    )

    print(
        "Expenses:",
        result["metrics"]["monthlyExpenses"]
    )

    print(
        "Profit:",
        result["metrics"]["monthlyProfit"]
    )

    print(
        "Expense Ratio:",
        result["metrics"]["expenseRatio"],
        "%"
    )

    print(
        "Profit Margin:",
        result["metrics"]["profitMargin"],
        "%"
    )

    print("\nDetected Risks:")

    for risk in result["detectedRisks"]:

        print(
            f"- {risk['type']} | "
            f"{risk['severity']} | "
            f"{risk['reason']}"
        )

    print("\nEarly Warnings:")

    for warning in result["earlyWarnings"]:

        print(
            f"- {warning['type']} | "
            f"{warning['severity']} | "
            f"{warning['reason']}"
        )

    print("\nFuture Risk:")

    print(
        "Future Score:",
        result["futureRisk"]["score"]
    )

    print(
        "Future Level:",
        result["futureRisk"]["riskLevel"]
    )

    print(
        "Prediction:",
        result["futureRisk"]["prediction"]
    )

    print("\nAnomalies:")

    for anomaly in result["anomalies"]:

        print(
            f"- {anomaly['type']} | "
            f"{anomaly['severity']} | "
            f"{anomaly['message']}"
        )

    print("\nRecommendations:")

    for recommendation in result["recommendations"]:

        print(
            "-",
            recommendation
        )

    print("\nRecommendation Actions:")

    for action in result["recommendationActions"]:

        print(
            f"- {action['area']} | "
            f"{action['priority']} | "
            f"{action['action']}"
        )

    print("\nMetrics:")

    print(
        result["metrics"]
    )