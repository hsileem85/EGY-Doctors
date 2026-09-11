import { Router, type IRouter } from "express";
import jwt from "jsonwebtoken";
import { GetWalletResponse } from "@workspace/api-zod";
import {
  getWalletWithTransactions,
  resolveWalletOwner,
} from "../lib/wallet.service.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-prod";
const router: IRouter = Router();

router.get("/wallet", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  let payload: { sub: number; role: string };
  try {
    payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as unknown as { sub: number; role: string };
  } catch {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const owner = await resolveWalletOwner(payload.sub, payload.role);
  if (!owner) {
    res.status(403).json({ error: "This account type does not have a wallet" });
    return;
  }

  const wallet = await getWalletWithTransactions(owner.ownerType, owner.ownerId);

  res.json(GetWalletResponse.parse({
    id: wallet.id,
    ownerType: wallet.ownerType,
    ownerId: wallet.ownerId,
    balance: wallet.balance,
    pendingFunds: wallet.pendingFunds,
    currency: wallet.currency,
    transactions: wallet.transactions.map((transaction) => ({
      id: transaction.id,
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      balancePost: transaction.balancePost,
      referenceId: transaction.referenceId,
      description: transaction.description,
      createdAt: transaction.createdAt.toISOString(),
    })),
  }));
});

export default router;