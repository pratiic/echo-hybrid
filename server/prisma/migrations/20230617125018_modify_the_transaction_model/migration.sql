-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "deletedForBuyer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deletedForSeller" BOOLEAN NOT NULL DEFAULT false;
