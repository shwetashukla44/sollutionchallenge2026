import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AIInsight {
  type: 'delay_risk' | 'cost_leak' | 'route_inefficiency' | 'billing_anomaly' | 'predictive_maintenance' | 'supply_chain_disruption' | 'route_optimization';
  severity?: 'info' | 'warning' | 'critical';
  title?: string;
  insight: string;
  confidence: number;
  potentialSavings?: number;
  recommendation?: string;
  trafficImpact?: string;
}

export async function getLogisticsInsights(operationalData: any): Promise<AIInsight[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          text: `You are a logistics AI operation assistant. Analyze the following operational data and provide insights on potential risks, predictive maintenance needs, and supply chain disruptions. 
          
          Data: ${JSON.stringify(operationalData)}
          
          Focus heavily on:
          1. Route Optimization: Suggest specific route adjustments for "in_transit" shipments based on current trajectories and simulated real-time traffic conditions.
          2. Delay risks: Predict delays caused by traffic congestion, weather alerts, or hub capacity issues.
          3. Predictive maintenance: Flag vehicles at risk based on mileage and health scores.
          4. Cost efficiency: Identify opportunities to reduce revenue leakage.
          
          Return results as a JSON array of insights. Each insight MUST include 'type', 'insight', 'confidence', and for route optimizations, include a 'title' and 'trafficImpact'.`
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { 
                type: Type.STRING, 
                enum: ['delay_risk', 'cost_leak', 'route_inefficiency', 'billing_anomaly', 'predictive_maintenance', 'supply_chain_disruption', 'route_optimization'] 
              },
              severity: { type: Type.STRING, enum: ['info', 'warning', 'critical'] },
              title: { type: Type.STRING },
              insight: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              potentialSavings: { type: Type.NUMBER },
              recommendation: { type: Type.STRING },
              trafficImpact: { type: Type.STRING }
            },
            required: ['type', 'insight', 'confidence']
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Insight Error:", error);
    return [];
  }
}

export interface RouteOptimization {
  distance: string;
  duration: string;
  optimizationScore: number;
  suggestions: {
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
  }[];
  bottlenecks: string[];
}

export async function getRouteOptimization(origin: string, destination: string): Promise<RouteOptimization | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          text: `You are a logistics route optimization expert. Analyze the route from ${origin} to ${destination}.
          Provide a detailed optimization plan including estimated distance, duration, an optimization score (0-100), and specific suggestions to improve efficiency (fuel, time, safety).
          Also identify potential bottlenecks (weather, traffic, infrastructure).
          
          Return as a JSON object.`
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            distance: { type: Type.STRING },
            duration: { type: Type.STRING },
            optimizationScore: { type: Type.NUMBER },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  impact: { type: Type.STRING, enum: ['low', 'medium', 'high'] }
                },
                required: ['title', 'description', 'impact']
              }
            },
            bottlenecks: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['distance', 'duration', 'optimizationScore', 'suggestions', 'bottlenecks']
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Route Optimization Error:", error);
    return null;
  }
}
