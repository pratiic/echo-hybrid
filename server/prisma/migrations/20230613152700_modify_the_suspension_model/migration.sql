/*
  Warnings:

  - Added the required column `targetType` to the `Suspension` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Suspension" ADD COLUMN     "targetType" TEXT NOT NULL;
