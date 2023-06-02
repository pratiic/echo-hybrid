/*
  Warnings:

  - You are about to drop the column `madeById` on the `OrderCompletion` table. All the data in the column will be lost.
  - You are about to drop the column `madeToId` on the `OrderCompletion` table. All the data in the column will be lost.
  - Added the required column `madeBy` to the `OrderCompletion` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderCompletionRequestor" AS ENUM ('SELLER', 'DELIVERY_PERSONNEL');

-- AlterTable
ALTER TABLE "OrderCompletion" DROP COLUMN "madeById",
DROP COLUMN "madeToId",
ADD COLUMN     "madeBy" "OrderCompletionRequestor" NOT NULL;
