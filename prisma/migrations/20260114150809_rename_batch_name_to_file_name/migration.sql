/*
  Warnings:

  - You are about to drop the column `batchName` on the `questions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "questions" DROP COLUMN "batchName",
ADD COLUMN     "fileName" TEXT DEFAULT 'Uploaded Questions';
