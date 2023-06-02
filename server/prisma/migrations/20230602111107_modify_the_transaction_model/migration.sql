/*
  Warnings:

  - You are about to drop the column `deleted` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "deleted",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
