import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedLensImages() {

  console.log('🌱 Start seeding lens images...')

  const listings = await prisma.lensListing.findMany()

  if (listings.length === 0) {

    console.log('❌ No lens listings found!')
    return
  }

  const images: Prisma.LensImageCreateManyInput[] = []

  for (const lens of listings) {

    // =========================
    // SONY A7III
    // =========================

    if (lens.title.includes('Sony A7III')) {

      images.push(

        {
          lens_id: lens.id,
          image_url:
            'https://images.unsplash.com/photo-1516035069371-29a1b244cc32'
        },

        {
          lens_id: lens.id,
          image_url:
            'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee'
        },

        {
          lens_id: lens.id,
          image_url:
            'https://images.unsplash.com/photo-1495707902641-75cac588d2e9'
        }
      )
    }

    // =========================
    // SONY 24-70 GM
    // =========================

    else if (lens.title.includes('24-70mm')) {

      images.push(

        {
          lens_id: lens.id,
          image_url:
            'https://images.unsplash.com/photo-1516724562728-afc824a36e84'
        },

        {
          lens_id: lens.id,
          image_url:
            'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c'
        },

        {
          lens_id: lens.id,
          image_url:
            'https://images.unsplash.com/photo-1519183071298-a2962eadc9f1'
        }
      )
    }

    // =========================
    // CANON EOS R6
    // =========================

    else if (lens.title.includes('Canon EOS R6')) {

      images.push(

        {
          lens_id: lens.id,
          image_url:
            'https://images.unsplash.com/photo-1502920917128-1aa500764cbd'
        },

        {
          lens_id: lens.id,
          image_url:
            'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39'
        },

        {
          lens_id: lens.id,
          image_url:
            'https://images.unsplash.com/photo-1516035069371-29a1b244cc32'
        }
      )
    }

    // =========================
    // SIGMA 35MM
    // =========================

    else if (lens.title.includes('Sigma 35mm')) {

      images.push(

        {
          lens_id: lens.id,
          image_url:
            'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39'
        },

        {
          lens_id: lens.id,
          image_url:
            'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c'
        },

        {
          lens_id: lens.id,
          image_url:
            'https://images.unsplash.com/photo-1519183071298-a2962eadc9f1'
        }
      )
    }

    // =========================
    // DJI RS3
    // =========================

    else if (lens.title.includes('RS3')) {

      images.push(

        {
          lens_id: lens.id,
          image_url:
            'https://images.unsplash.com/photo-1529078155058-5d716f45d604'
        },

        {
          lens_id: lens.id,
          image_url:
            'https://images.unsplash.com/photo-1516035069371-29a1b244cc32'
        },

        {
          lens_id: lens.id,
          image_url:
            'https://images.unsplash.com/photo-1495707902641-75cac588d2e9'
        }
      )
    }

    // =========================
    // DJI MINI 4 PRO
    // =========================

    else if (lens.title.includes('Mini 4')) {

      images.push(

        {
          lens_id: lens.id,
          image_url:
            'https://images.unsplash.com/photo-1473968512647-3e447244af8f'
        },

        {
          lens_id: lens.id,
          image_url:
            'https://images.unsplash.com/photo-1508614589041-895b88991e3e'
        },

        {
          lens_id: lens.id,
          image_url:
            'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee'
        }
      )
    }
  }

  await prisma.lensImage.createMany({

    data: images,

    skipDuplicates: true
  })

  console.log(`✅ Seeded ${images.length} lens images successfully!`)
}