-- AlterTable
ALTER TABLE "users" ADD COLUMN     "lastLoginTime" TIMESTAMP(3),
ADD COLUMN     "lastQuestionDate" TIMESTAMP(3),
ADD COLUMN     "lastQuestionId" INTEGER;
