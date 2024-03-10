/*
  Warnings:

  - Made the column `title` on table `PriceLine` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PriceLine" ALTER COLUMN "title" SET NOT NULL;
