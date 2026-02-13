/*
  Warnings:

  - You are about to alter the column `title` on the `boards` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `icon` on the `boards` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `title` on the `columns` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `title` on the `tasks` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `position` on the `tasks` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,4)`.
  - A unique constraint covering the columns `[position,board_id]` on the table `columns` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[column_id,position]` on the table `tasks` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `owner_id` to the `columns` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner_id` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_taskId_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_userId_fkey";

-- AlterTable
ALTER TABLE "boards" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ALTER COLUMN "title" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "icon" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "columns" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "owner_id" TEXT NOT NULL,
ALTER COLUMN "title" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "ownerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "owner_id" TEXT NOT NULL,
ALTER COLUMN "title" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "position" SET DATA TYPE DECIMAL(10,4);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "boards_owner_id_idx" ON "boards"("owner_id");

-- CreateIndex
CREATE INDEX "columns_owner_id_idx" ON "columns"("owner_id");

-- CreateIndex
CREATE INDEX "columns_board_id_idx" ON "columns"("board_id");

-- CreateIndex
CREATE UNIQUE INDEX "columns_position_board_id_key" ON "columns"("position", "board_id");

-- CreateIndex
CREATE INDEX "comments_userId_idx" ON "comments"("userId");

-- CreateIndex
CREATE INDEX "comments_taskId_idx" ON "comments"("taskId");

-- CreateIndex
CREATE INDEX "comments_ownerId_idx" ON "comments"("ownerId");

-- CreateIndex
CREATE INDEX "tasks_owner_id_idx" ON "tasks"("owner_id");

-- CreateIndex
CREATE INDEX "tasks_assignee_id_idx" ON "tasks"("assignee_id");

-- CreateIndex
CREATE INDEX "tasks_column_id_idx" ON "tasks"("column_id");

-- CreateIndex
CREATE UNIQUE INDEX "tasks_column_id_position_key" ON "tasks"("column_id", "position");

-- AddForeignKey
ALTER TABLE "columns" ADD CONSTRAINT "columns_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
