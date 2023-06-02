-- AlterTable
ALTER TABLE "User" ADD COLUMN     "CONCAT(firstName, ' ', lastName)" TEXT NOT NULL DEFAULT '';
