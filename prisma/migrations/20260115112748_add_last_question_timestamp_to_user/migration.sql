/*
  Warnings:

  - You are about to drop the column `lastLoginTime` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastQuestionDate` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastQuestionId` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "lastLoginTime",
DROP COLUMN "lastQuestionDate",
DROP COLUMN "lastQuestionId",
ADD COLUMN     "lastQuestionIndex" INTEGER,
ADD COLUMN     "lastQuestionTimestamp" TIMESTAMP(3);
