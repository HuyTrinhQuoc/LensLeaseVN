-- CreateTable
CREATE TABLE "lens_specs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "lens_id" UUID NOT NULL,
    "focal_length" TEXT,
    "max_aperture" TEXT,
    "mount" TEXT,
    "sensor_format" TEXT,
    "min_focus_distance" DOUBLE PRECISION,
    "filter_size" INTEGER,
    "image_stabilization" BOOLEAN,
    "weight" INTEGER,
    "autofocus_motor" TEXT,
    "dimensions" TEXT,

    CONSTRAINT "lens_specs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lens_specs_lens_id_key" ON "lens_specs"("lens_id");

-- AddForeignKey
ALTER TABLE "lens_specs" ADD CONSTRAINT "lens_specs_lens_id_fkey" FOREIGN KEY ("lens_id") REFERENCES "lens_listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
