/*
  Warnings:

  - Added the required column `deliveryCharge` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "deliveryCharge" DOUBLE PRECISION NOT NULL;
