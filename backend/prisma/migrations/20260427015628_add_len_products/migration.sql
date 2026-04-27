-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "full_name" TEXT,
    "email" TEXT,
    "password_hash" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "role" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lens_listings" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "owner_id" UUID,
    "title" TEXT,
    "description" TEXT,
    "brand" TEXT,
    "type" TEXT,
    "category" TEXT,
    "location" TEXT,
    "price_per_day" DECIMAL,
    "thumbnail" TEXT,
    "rating_avg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rating_count" INTEGER NOT NULL DEFAULT 0,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lens_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lens_images" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "lens_id" UUID,
    "image_url" TEXT,
    "is_main" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "lens_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID,
    "lens_id" UUID,
    "start_date" DATE,
    "end_date" DATE,
    "status" TEXT,
    "total_price" DECIMAL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID,
    "lens_id" UUID,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "lens_listings_price_per_day_idx" ON "lens_listings"("price_per_day");

-- CreateIndex
CREATE INDEX "lens_listings_brand_idx" ON "lens_listings"("brand");

-- CreateIndex
CREATE INDEX "lens_listings_type_idx" ON "lens_listings"("type");

-- CreateIndex
CREATE INDEX "lens_listings_category_idx" ON "lens_listings"("category");

-- CreateIndex
CREATE INDEX "lens_listings_location_idx" ON "lens_listings"("location");

-- CreateIndex
CREATE INDEX "bookings_lens_id_start_date_end_date_idx" ON "bookings"("lens_id", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "reviews_lens_id_idx" ON "reviews"("lens_id");

-- AddForeignKey
ALTER TABLE "lens_listings" ADD CONSTRAINT "lens_listings_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lens_images" ADD CONSTRAINT "lens_images_lens_id_fkey" FOREIGN KEY ("lens_id") REFERENCES "lens_listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_lens_id_fkey" FOREIGN KEY ("lens_id") REFERENCES "lens_listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_lens_id_fkey" FOREIGN KEY ("lens_id") REFERENCES "lens_listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
