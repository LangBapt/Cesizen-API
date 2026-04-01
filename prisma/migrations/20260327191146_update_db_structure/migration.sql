/*
  Warnings:

  - You are about to drop the `Compose` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Exercise` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Handle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Information` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Manage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RespirationPhase` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- DropForeignKey
ALTER TABLE "Compose" DROP CONSTRAINT "Compose_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "Compose" DROP CONSTRAINT "Compose_respirationPhaseId_fkey";

-- DropForeignKey
ALTER TABLE "Handle" DROP CONSTRAINT "Handle_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "Handle" DROP CONSTRAINT "Handle_userId_fkey";

-- DropForeignKey
ALTER TABLE "Manage" DROP CONSTRAINT "Manage_informationId_fkey";

-- DropForeignKey
ALTER TABLE "Manage" DROP CONSTRAINT "Manage_userId_fkey";

-- DropTable
DROP TABLE "Compose";

-- DropTable
DROP TABLE "Exercise";

-- DropTable
DROP TABLE "Handle";

-- DropTable
DROP TABLE "Information";

-- DropTable
DROP TABLE "Manage";

-- DropTable
DROP TABLE "RespirationPhase";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "user" (
    "idUser" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activated" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_pkey" PRIMARY KEY ("idUser")
);

-- CreateTable
CREATE TABLE "refresh_token" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "information" (
    "idInformation" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "publicationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "information_pkey" PRIMARY KEY ("idInformation")
);

-- CreateTable
CREATE TABLE "manage" (
    "userId" INTEGER NOT NULL,
    "informationId" INTEGER NOT NULL,
    "updateDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manage_pkey" PRIMARY KEY ("userId","informationId")
);

-- CreateTable
CREATE TABLE "exercise" (
    "idExercise" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "instructions" TEXT NOT NULL,

    CONSTRAINT "exercise_pkey" PRIMARY KEY ("idExercise")
);

-- CreateTable
CREATE TABLE "handle" (
    "userId" INTEGER NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "updateDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "handle_pkey" PRIMARY KEY ("userId","exerciseId")
);

-- CreateTable
CREATE TABLE "respiration_phase" (
    "idRespirationPhase" SERIAL NOT NULL,
    "respirationPhaseName" TEXT NOT NULL,

    CONSTRAINT "respiration_phase_pkey" PRIMARY KEY ("idRespirationPhase")
);

-- CreateTable
CREATE TABLE "compose" (
    "exerciseId" INTEGER NOT NULL,
    "respirationPhaseId" INTEGER NOT NULL,
    "phaseOrder" INTEGER NOT NULL,
    "durationSeconds" INTEGER NOT NULL,

    CONSTRAINT "compose_pkey" PRIMARY KEY ("exerciseId","respirationPhaseId")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_token_token_key" ON "refresh_token"("token");

-- AddForeignKey
ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("idUser") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manage" ADD CONSTRAINT "manage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("idUser") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manage" ADD CONSTRAINT "manage_informationId_fkey" FOREIGN KEY ("informationId") REFERENCES "information"("idInformation") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handle" ADD CONSTRAINT "handle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("idUser") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handle" ADD CONSTRAINT "handle_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercise"("idExercise") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compose" ADD CONSTRAINT "compose_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercise"("idExercise") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compose" ADD CONSTRAINT "compose_respirationPhaseId_fkey" FOREIGN KEY ("respirationPhaseId") REFERENCES "respiration_phase"("idRespirationPhase") ON DELETE CASCADE ON UPDATE CASCADE;
