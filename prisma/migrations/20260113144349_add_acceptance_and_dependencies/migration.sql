/*
  Warnings:

  - A unique constraint covering the columns `[projectId,name]` on the table `Area` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[projectId,title]` on the table `Task` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "acceptanceCriteria" TEXT,
ADD COLUMN     "dependencies" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Area_projectId_name_key" ON "Area"("projectId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Project_name_key" ON "Project"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Task_projectId_title_key" ON "Task"("projectId", "title");
