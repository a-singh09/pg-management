/**
 * Profit/Loss data transformer for converting between frontend and backend models
 */

import { BaseTransformer } from "./base-transformer";

// Frontend profit/loss interfaces
export interface ProfitLossData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface ProfitLossAnalysis {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  monthlyData: ProfitLossData[];
}

export interface ProfitLossSummary {
  currentMonth: {
    revenue: number;
    expenses: number;
    profit: number;
    profitMargin: number;
  };
  previousMonth: {
    revenue: number;
    expenses: number;
    profit: number;
    profitMargin: number;
  };
  growth: {
    revenue: number;
    expenses: number;
    profit: number;
  };
}

export interface PropertyProfitLoss {
  propertyId: string;
  propertyName: string;
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
  monthlyBreakdown: ProfitLossData[];
}

export interface MonthlyTrends {
  trends: ProfitLossData[];
  averages: {
    revenue: number;
    expenses: number;
    profit: number;
  };
  projections: {
    nextMonth: ProfitLossData;
    nextQuarter: ProfitLossData[];
  };
}

export interface FinancialRecommendations {
  recommendations: {
    type: "cost_reduction" | "revenue_increase" | "efficiency" | "investment";
    title: string;
    description: string;
    impact: "high" | "medium" | "low";
    priority: number;
  }[];
  insights: {
    topExpenseCategories: {
      category: string;
      amount: number;
      percentage: number;
    }[];
    revenueGrowthRate: number;
    expenseGrowthRate: number;
    profitabilityTrend: "improving" | "declining" | "stable";
  };
}

// Backend profit/loss interfaces
export interface BackendProfitLossData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface BackendProfitLossAnalysis {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  profit_margin: number;
  monthly_data: BackendProfitLossData[];
}

export interface BackendProfitLossSummary {
  current_month: {
    revenue: number;
    expenses: number;
    profit: number;
    profit_margin: number;
  };
  previous_month: {
    revenue: number;
    expenses: number;
    profit: number;
    profit_margin: number;
  };
  growth: {
    revenue: number;
    expenses: number;
    profit: number;
  };
}

export interface BackendPropertyProfitLoss {
  property_id: string;
  property_name: string;
  revenue: number;
  expenses: number;
  profit: number;
  profit_margin: number;
  monthly_breakdown: BackendProfitLossData[];
}

export interface BackendMonthlyTrends {
  trends: BackendProfitLossData[];
  averages: {
    revenue: number;
    expenses: number;
    profit: number;
  };
  projections: {
    next_month: BackendProfitLossData;
    next_quarter: BackendProfitLossData[];
  };
}

export interface BackendFinancialRecommendations {
  recommendations: {
    type: string;
    title: string;
    description: string;
    impact: string;
    priority: number;
  }[];
  insights: {
    top_expense_categories: {
      category: string;
      amount: number;
      percentage: number;
    }[];
    revenue_growth_rate: number;
    expense_growth_rate: number;
    profitability_trend: string;
  };
}

class ProfitLossTransformer extends BaseTransformer<
  ProfitLossData,
  BackendProfitLossData
> {
  /**
   * Transform backend profit/loss data to frontend format
   */
  toFrontend(backendData: BackendProfitLossData): ProfitLossData {
    return {
      month: backendData.month,
      revenue: backendData.revenue,
      expenses: backendData.expenses,
      profit: backendData.profit,
    };
  }

  /**
   * Transform frontend profit/loss data to backend format
   */
  toBackend(frontendData: ProfitLossData): BackendProfitLossData {
    return {
      month: frontendData.month,
      revenue: frontendData.revenue,
      expenses: frontendData.expenses,
      profit: frontendData.profit,
    };
  }

  /**
   * Transform backend analysis to frontend format
   */
  toFrontendAnalysis(
    backendAnalysis: BackendProfitLossAnalysis,
  ): ProfitLossAnalysis {
    return {
      totalRevenue: backendAnalysis.total_revenue,
      totalExpenses: backendAnalysis.total_expenses,
      netProfit: backendAnalysis.net_profit,
      profitMargin: backendAnalysis.profit_margin,
      monthlyData: backendAnalysis.monthly_data.map((data) =>
        this.toFrontend(data),
      ),
    };
  }

  /**
   * Transform backend summary to frontend format
   */
  toFrontendSummary(
    backendSummary: BackendProfitLossSummary,
  ): ProfitLossSummary {
    return {
      currentMonth: {
        revenue: backendSummary.current_month.revenue,
        expenses: backendSummary.current_month.expenses,
        profit: backendSummary.current_month.profit,
        profitMargin: backendSummary.current_month.profit_margin,
      },
      previousMonth: {
        revenue: backendSummary.previous_month.revenue,
        expenses: backendSummary.previous_month.expenses,
        profit: backendSummary.previous_month.profit,
        profitMargin: backendSummary.previous_month.profit_margin,
      },
      growth: {
        revenue: backendSummary.growth.revenue,
        expenses: backendSummary.growth.expenses,
        profit: backendSummary.growth.profit,
      },
    };
  }

  /**
   * Transform backend property P&L to frontend format
   */
  toFrontendPropertyProfitLoss(
    backendData: BackendPropertyProfitLoss,
  ): PropertyProfitLoss {
    return {
      propertyId: backendData.property_id,
      propertyName: backendData.property_name,
      revenue: backendData.revenue,
      expenses: backendData.expenses,
      profit: backendData.profit,
      profitMargin: backendData.profit_margin,
      monthlyBreakdown: backendData.monthly_breakdown.map((data) =>
        this.toFrontend(data),
      ),
    };
  }

  /**
   * Transform backend monthly trends to frontend format
   */
  toFrontendMonthlyTrends(backendTrends: BackendMonthlyTrends): MonthlyTrends {
    return {
      trends: backendTrends.trends.map((data) => this.toFrontend(data)),
      averages: {
        revenue: backendTrends.averages.revenue,
        expenses: backendTrends.averages.expenses,
        profit: backendTrends.averages.profit,
      },
      projections: {
        nextMonth: this.toFrontend(backendTrends.projections.next_month),
        nextQuarter: backendTrends.projections.next_quarter.map((data) =>
          this.toFrontend(data),
        ),
      },
    };
  }

  /**
   * Transform backend recommendations to frontend format
   */
  toFrontendRecommendations(
    backendRecs: BackendFinancialRecommendations,
  ): FinancialRecommendations {
    return {
      recommendations: backendRecs.recommendations.map((rec) => ({
        type: rec.type as
          | "cost_reduction"
          | "revenue_increase"
          | "efficiency"
          | "investment",
        title: rec.title,
        description: rec.description,
        impact: rec.impact as "high" | "medium" | "low",
        priority: rec.priority,
      })),
      insights: {
        topExpenseCategories: backendRecs.insights.top_expense_categories.map(
          (cat) => ({
            category: cat.category,
            amount: cat.amount,
            percentage: cat.percentage,
          }),
        ),
        revenueGrowthRate: backendRecs.insights.revenue_growth_rate,
        expenseGrowthRate: backendRecs.insights.expense_growth_rate,
        profitabilityTrend: backendRecs.insights.profitability_trend as
          | "improving"
          | "declining"
          | "stable",
      },
    };
  }
}

// Export singleton instance
export const profitLossTransformer = new ProfitLossTransformer();
export default profitLossTransformer;
