/*
  Warnings:

  - You are about to drop the column `label` on the `tasks` table. All the data in the column will be lost.
  - The `priority` column on the `tasks` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "boards" ADD COLUMN     "icon" TEXT;

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "label",
ADD COLUMN     "tags" TEXT[],
DROP COLUMN "priority",
ADD COLUMN     "priority" "Priority" DEFAULT 'MEDIUM';
