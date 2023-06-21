/*
  Warnings:

  - Made the column `userId` on table `Store` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Store" ALTER COLUMN "userId" SET NOT NULL;
