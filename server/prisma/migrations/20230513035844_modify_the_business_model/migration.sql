/*
  Warnings:

  - You are about to drop the column `isVerified` on the `Business` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "BusinessStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "Business" DROP COLUMN "isVerified",
ADD COLUMN     "status" "BusinessStatus" NOT NULL DEFAULT 'PENDING';
