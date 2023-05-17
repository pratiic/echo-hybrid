/*
  Warnings:

  - The `deliveryCharge` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `isDelivered` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "isDelivered" BOOLEAN NOT NULL,
DROP COLUMN "deliveryCharge",
ADD COLUMN     "deliveryCharge" INTEGER,
ALTER COLUMN "quantity" DROP NOT NULL;
