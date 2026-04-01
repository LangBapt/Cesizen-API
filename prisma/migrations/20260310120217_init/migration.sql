-- CreateTable
CREATE TABLE "User" (
    "idUser" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("idUser")
);

-- CreateTable
CREATE TABLE "Information" (
    "idInformation" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "publicationDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Information_pkey" PRIMARY KEY ("idInformation")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "idExercise" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "instructions" TEXT NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("idExercise")
);

-- CreateTable
CREATE TABLE "RespirationPhase" (
    "idRespirationPhase" SERIAL NOT NULL,
    "respirationPhaseName" TEXT NOT NULL,

    CONSTRAINT "RespirationPhase_pkey" PRIMARY KEY ("idRespirationPhase")
);

-- CreateTable
CREATE TABLE "Manage" (
    "userId" INTEGER NOT NULL,
    "informationId" INTEGER NOT NULL,
    "updateDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manage_pkey" PRIMARY KEY ("userId","informationId")
);

-- CreateTable
CREATE TABLE "Handle" (
    "userId" INTEGER NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "updateDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Handle_pkey" PRIMARY KEY ("userId","exerciseId")
);

-- CreateTable
CREATE TABLE "Compose" (
    "exerciseId" INTEGER NOT NULL,
    "respirationPhaseId" INTEGER NOT NULL,
    "phase_order" INTEGER NOT NULL,
    "duration_seconds" INTEGER NOT NULL,

    CONSTRAINT "Compose_pkey" PRIMARY KEY ("exerciseId","respirationPhaseId","phase_order")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Manage" ADD CONSTRAINT "Manage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manage" ADD CONSTRAINT "Manage_informationId_fkey" FOREIGN KEY ("informationId") REFERENCES "Information"("idInformation") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Handle" ADD CONSTRAINT "Handle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Handle" ADD CONSTRAINT "Handle_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("idExercise") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compose" ADD CONSTRAINT "Compose_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("idExercise") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compose" ADD CONSTRAINT "Compose_respirationPhaseId_fkey" FOREIGN KEY ("respirationPhaseId") REFERENCES "RespirationPhase"("idRespirationPhase") ON DELETE RESTRICT ON UPDATE CASCADE;
