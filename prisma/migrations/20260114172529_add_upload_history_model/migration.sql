-- AlterTable
ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL;

-- CreateTable
CREATE TABLE "upload_history" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "quizName" TEXT,
    "questionCount" INTEGER NOT NULL,
    "quizSetId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'success',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "upload_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "upload_history" ADD CONSTRAINT "upload_history_quizSetId_fkey" FOREIGN KEY ("quizSetId") REFERENCES "quiz_sets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
