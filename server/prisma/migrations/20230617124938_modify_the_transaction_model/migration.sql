/*
  Warnings:

  - You are about to drop the column `deletedFor` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `deletedForList` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "deletedFor",
DROP COLUMN "deletedForList";
