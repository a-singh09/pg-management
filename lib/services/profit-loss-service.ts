/**
 * Profit/Loss service for handling profit/loss analytics API operations
 */

import { apiClient } from "../api-client";
import {
  profitLossTransformer,
  ProfitLossAnalysis,
  ProfitLossSummary,
  PropertyProfitLoss,
  MonthlyTrends,
  FinancialRecommendations,
  BackendProfitLossAnalysis,
  BackendProfitLossSummary,
  BackendPropertyProfitLoss,
  BackendMonthlyTrends,
  BackendFinancialRecommendations,
} from "../transformers/profit-loss-transformer";

export interface ProfitLossService {
  getAnalysis(): Promise<ProfitLossAnalysis>;
  getSummary(): Promise<ProfitLossSummary>;
  getPropertyProfitLoss(propertyId: string): Promise<PropertyProfitLoss>;
  getMonthlyTrends(): Promise<MonthlyTrends>;
  getRecommendations(): Promise<FinancialRecommendations>;
}

class ProfitLossServiceImpl implements ProfitLossService {
  private readonly endpoint = "/api/profit-loss";

  /**
   * Get comprehensive profit/loss analysis
   */
  async getAnalysis(): Promise<ProfitLossAnalysis> {
    try {
      const backendAnalysis: BackendProfitLossAnalysis = await apiClient.get(
        `${this.endpoint}/analysis`,
      );
      return profitLossTransformer.toFrontendAnalysis(backendAnalysis);
    } catch (error) {
      console.error("Failed to fetch profit/loss analysis:", error);
      throw error;
    }
  }

  /**
   * Get financial summary with current vs previous month comparison
   */
  async getSummary(): Promise<ProfitLossSummary> {
    try {
      const backendSummary: BackendProfitLossSummary = await apiClient.get(
        `${this.endpoint}/summary`,
      );
      return profitLossTransformer.toFrontendSummary(backendSummary);
    } catch (error) {
      console.error("Failed to fetch profit/loss summary:", error);
      throw error;
    }
  }

  /**
   * Get property-specific profit/loss data
   */
  async getPropertyProfitLoss(propertyId: string): Promise<PropertyProfitLoss> {
    try {
      const backendPropertyPL: BackendPropertyProfitLoss = await apiClient.get(
        `${this.endpoint}/property/${propertyId}`,
      );
      return profitLossTransformer.toFrontendPropertyProfitLoss(
        backendPropertyPL,
      );
    } catch (error) {
      console.error(
        `Failed to fetch property profit/loss for ${propertyId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get monthly trends with projections
   */
  async getMonthlyTrends(): Promise<MonthlyTrends> {
    try {
      const backendTrends: BackendMonthlyTrends = await apiClient.get(
        `${this.endpoint}/trends/monthly`,
      );
      return profitLossTransformer.toFrontendMonthlyTrends(backendTrends);
    } catch (error) {
      console.error("Failed to fetch monthly trends:", error);
      throw error;
    }
  }

  /**
   * Get financial recommendations and insights
   */
  async getRecommendations(): Promise<FinancialRecommendations> {
    try {
      const backendRecommendations: BackendFinancialRecommendations =
        await apiClient.get(`${this.endpoint}/recommendations`);
      return profitLossTransformer.toFrontendRecommendations(
        backendRecommendations,
      );
    } catch (error) {
      console.error("Failed to fetch financial recommendations:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const profitLossService = new ProfitLossServiceImpl();
export default profitLossService;
