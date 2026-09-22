const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
    {
        // =========================
        // BASIC BUSINESS DETAILS
        // =========================
        businessName: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        // =========================
        // UNIVERSAL FINANCIAL DATA
        // =========================
        monthlyRevenue: {
            type: Number,
            required: true,
            min: 0
        },

        monthlyExpenses: {
            type: Number,
            required: true,
            min: 0
        },

        monthlyProfit: {
            type: Number,
            default: 0
        },

        // =========================
        // AI RISK DATA
        // =========================
        overallRiskScore: {
            type: Number,
            default: 0
        },

        riskLevel: {
            type: String,
            enum: ["Low", "Medium", "High", "Critical"],
            default: "Low"
        },

        aiPrediction: {
            type: String,
            default: "No prediction available"
        },

        lastRiskAnalysis: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Business", businessSchema);