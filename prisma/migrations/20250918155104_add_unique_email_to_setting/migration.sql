/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Setting` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Setting_email_key" ON "Setting"("email");
