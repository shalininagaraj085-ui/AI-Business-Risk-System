from flask import Flask, request, jsonify
from risk_engine import calculate_risk

app = Flask(__name__)


# =====================================================
# HOME
# =====================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "success": True,
        "message": "AI Business Risk API is running!"
    })


# =====================================================
# 1. AI RISK ANALYSIS API
# =====================================================

@app.route("/api/risk/analyze", methods=["POST"])
def analyze_risk():

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "success": False,
                "message": "Business data is required"
            }), 400

        result = calculate_risk(data)

        return jsonify({
            "success": True,
            "message": "Business risk analysis completed",
            "analysis": result
        })

    except Exception as error:

        print("AI Risk Analysis Error:", error)

        return jsonify({
            "success": False,
            "message": "Risk analysis failed",
            "error": str(error)
        }), 500


# =====================================================
# 2. ANOMALY DETECTION API
# =====================================================

@app.route("/api/risk/anomalies", methods=["POST"])
def detect_anomalies():

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "success": False,
                "message": "Business data is required"
            }), 400

        result = calculate_risk(data)

        return jsonify({
            "success": True,
            "message": "Business anomaly detection completed",
            "anomalies": result.get(
                "anomalies",
                []
            )
        })

    except Exception as error:

        print("Anomaly Detection Error:", error)

        return jsonify({
            "success": False,
            "message": "Anomaly detection failed",
            "error": str(error)
        }), 500


# =====================================================
# 3. AI RECOMMENDATION ENGINE API
# =====================================================

@app.route("/api/risk/recommendations", methods=["POST"])
def generate_recommendations():

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "success": False,
                "message": "Business data is required"
            }), 400

        result = calculate_risk(data)

        return jsonify({
            "success": True,
            "message": "AI recommendations generated",
            "recommendations": result.get(
                "recommendationActions",
                []
            )
        })

    except Exception as error:

        print("Recommendation Engine Error:", error)

        return jsonify({
            "success": False,
            "message": "Recommendation generation failed",
            "error": str(error)
        }), 500


# =====================================================
# 4. FUTURE RISK PREDICTION API
# =====================================================

@app.route("/api/risk/future", methods=["POST"])
def future_risk():

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "success": False,
                "message": "Business data is required"
            }), 400

        result = calculate_risk(data)

        return jsonify({
            "success": True,
            "message": "Future business risk prediction completed",
            "futureRisk": result.get(
                "futureRisk",
                {}
            )
        })

    except Exception as error:

        print("Future Risk Prediction Error:", error)

        return jsonify({
            "success": False,
            "message": "Future risk prediction failed",
            "error": str(error)
        }), 500


# =====================================================
# SERVER START
# =====================================================

if __name__ == "__main__":

    print("🤖 AI Business Risk API starting...")
    print(
        "📊 Risk Analysis Endpoint: "
        "http://localhost:8000/api/risk/analyze"
    )

    print(
        "⚠️ Anomaly Endpoint: "
        "http://localhost:8000/api/risk/anomalies"
    )

    print(
        "💡 Recommendation Endpoint: "
        "http://localhost:8000/api/risk/recommendations"
    )

    print(
        "🔮 Future Risk Endpoint: "
        "http://localhost:8000/api/risk/future"
    )

    app.run(
        host="0.0.0.0",
        port=8000,
        debug=True
    )