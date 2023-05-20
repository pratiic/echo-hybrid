/*
  Warnings:

  - Made the column `unseenMsgsCounts` on table `Chat` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Chat" ALTER COLUMN "unseenMsgsCounts" SET NOT NULL;
