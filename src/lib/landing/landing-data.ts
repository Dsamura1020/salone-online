import { prisma } from "@/lib/prisma/prisma";
import {
  getTopRatedBusinesses,
  type RegisteredBusiness,
} from "@/lib/business/registered-businesses";
import { publicBusinessWhere } from "@/lib/business/public-visibility";

export type LandingBusiness = RegisteredBusiness;

export type LandingStats = {
  businessesListed: number;
  verifiedAccounts: number;
  newThisMonth: number;
  monthlyGrowthPercent: number;
};

export type LandingPageData = {
  stats: LandingStats;
  topRatedBusinesses: RegisteredBusiness[];
};

function trendPercent(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
}

export async function getLandingPageData(): Promise<LandingPageData> {
  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    businessesListed,
    verifiedAccounts,
    newThisMonth,
    newLastMonth,
    topRatedBusinesses,
  ] = await Promise.all([
    prisma.business.count({ where: publicBusinessWhere }),
    prisma.business.count({
      where: { ...publicBusinessWhere, isVerified: true },
    }),
    prisma.business.count({
      where: {
        ...publicBusinessWhere,
        createdAt: { gte: monthAgo },
      },
    }),
    prisma.business.count({
      where: {
        ...publicBusinessWhere,
        createdAt: { gte: twoMonthsAgo, lt: monthAgo },
      },
    }),
    getTopRatedBusinesses(5),
  ]);

  return {
    stats: {
      businessesListed,
      verifiedAccounts,
      newThisMonth,
      monthlyGrowthPercent: trendPercent(newThisMonth, newLastMonth),
    },
    topRatedBusinesses,
  };
}
