import { AppError } from "../../shared/errors/AppError";
import { emailService } from "../../shared/services/email";
import { UserModel } from "../auth/auth.schema";
import * as earningsRepository from "./earnings.repository";
import { TransactionFilters } from "./earnings.repository";

export const MIN_PAYOUT_SAR = 50;

export const getSummary = async (lenderId: string) => {
  const [totalEarnings, paidOut, monthlyBreakdown] = await Promise.all([
    earningsRepository.sumCompletedEarnings(lenderId),
    earningsRepository.sumPaidPayouts(lenderId),
    earningsRepository.getMonthlyBreakdown(lenderId),
  ]);

  const pendingPayoutBalance = Math.max(0, totalEarnings - paidOut);

  return { totalEarnings, pendingPayoutBalance, monthlyBreakdown };
};

export const getTransactions = async (
  lenderId: string,
  filters: TransactionFilters,
) => earningsRepository.getTransactions(lenderId, filters);

export const requestPayout = async (lenderId: string) => {
  const [totalEarnings, paidOut, existing] = await Promise.all([
    earningsRepository.sumCompletedEarnings(lenderId),
    earningsRepository.sumPaidPayouts(lenderId),
    earningsRepository.findActivePayout(lenderId),
  ]);

  if (existing) {
    throw new AppError(
      "A payout request is already pending or being processed",
      409,
      "PAYOUT_ALREADY_PENDING",
    );
  }

  const balance = Math.max(0, totalEarnings - paidOut);
  if (balance < MIN_PAYOUT_SAR) {
    throw new AppError(
      `Minimum payout is SAR ${MIN_PAYOUT_SAR}. Your current balance is SAR ${balance.toFixed(2)}.`,
      400,
      "INSUFFICIENT_BALANCE",
    );
  }

  const payout = await earningsRepository.createPayout({
    lenderId,
    amount: balance,
  });

  // Send confirmation email (fire-and-forget)
  const lender = await UserModel.findById(lenderId).lean();
  if (lender) {
    emailService
      .sendPayoutRequestedEmail({
        to: lender.email,
        lenderName: lender.name,
        amount: balance,
        payoutId: String(payout._id),
      })
      .catch(() => undefined);
  }

  return payout;
};

export const getPayoutHistory = async (lenderId: string) =>
  earningsRepository.findPayoutsByLender(lenderId);
