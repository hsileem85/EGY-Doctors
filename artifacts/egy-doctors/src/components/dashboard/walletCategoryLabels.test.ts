import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { getWalletCategoryLabel, walletCategoryLabels } from "./walletCategoryLabels";

function getApiWalletCategories() {
  const specPath = fileURLToPath(
    new URL("../../../../../lib/api-spec/openapi.yaml", import.meta.url),
  );
  const spec = readFileSync(specPath, "utf8");
  const walletTransactionSchema = spec.match(
    /    WalletTransaction:\n([\s\S]*?)(?=\n    [A-Za-z][A-Za-z0-9]+:)/,
  )?.[1];
  const categoryEnum = walletTransactionSchema?.match(
    /        category:\n          type: string\n          enum: \[([^\]]+)\]/,
  )?.[1];

  if (!categoryEnum) {
    throw new Error("WalletTransaction category enum was not found in openapi.yaml");
  }

  return categoryEnum.split(",").map((category) => category.trim());
}

describe("shared wallet transaction category labels", () => {
  it("provides English and Arabic display text for every API category", () => {
    for (const category of getApiWalletCategories()) {
      const label = walletCategoryLabels[category as keyof typeof walletCategoryLabels];

      expect(label, `${category} is missing a wallet display label`).toBeDefined();
      expect(label?.en.trim(), `${category} is missing English display text`).not.toBe("");
      expect(label?.ar.trim(), `${category} is missing Arabic display text`).not.toBe("");
    }
  });

  it("keeps unknown future categories readable", () => {
    expect(getWalletCategoryLabel("FUTURE_WALLET_REWARD", false)).toBe(
      "Future Wallet Reward",
    );
    expect(getWalletCategoryLabel("FUTURE_WALLET_REWARD", true)).toBe(
      "Future Wallet Reward",
    );
  });
});