import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedLensSpecs() {

  console.log('🌱 Start seeding lens specs...')

  const listings = await prisma.lensListing.findMany()

  if (listings.length === 0) {

    console.log('❌ No lens listings found!')
    return
  }

  const specs: Prisma.LensSpecCreateManyInput[] = []

  for (const lens of listings) {

    // =========================
    // SONY A7III
    // =========================

    if (lens.title.includes('Sony A7III')) {

      specs.push({

        lens_id: lens.id,

        focal_length: null,

        max_aperture: null,

        mount: 'Sony E',

        sensor_format: 'Full Frame',

        image_stabilization: true
      })
    }

    // =========================
    // SONY 24-70 GM
    // =========================

    else if (lens.title.includes('24-70mm')) {

      specs.push({

        lens_id: lens.id,

        focal_length: '24-70mm',

        max_aperture: 'f/2.8',

        mount: 'Sony E',

        sensor_format: 'Full Frame',

        image_stabilization: false
      })
    }

    // =========================
    // CANON EOS R6
    // =========================

    else if (lens.title.includes('Canon EOS R6')) {

      specs.push({

        lens_id: lens.id,

        focal_length: null,

        max_aperture: null,

        mount: 'Canon RF',

        sensor_format: 'Full Frame',

        image_stabilization: true
      })
    }

    // =========================
    // SIGMA 35MM
    // =========================

    else if (lens.title.includes('Sigma 35mm')) {

      specs.push({

        lens_id: lens.id,

        focal_length: '35mm',

        max_aperture: 'f/1.4',

        mount: 'Sony E',

        sensor_format: 'Full Frame',

        image_stabilization: false
      })
    }

    // =========================
    // DJI RS3
    // =========================

    else if (lens.title.includes('RS3')) {

      specs.push({

        lens_id: lens.id,

        focal_length: null,

        max_aperture: null,

        mount: null,

        sensor_format: null,

        image_stabilization: true
      })
    }

    // =========================
    // DJI MINI 4 PRO
    // =========================

    else if (lens.title.includes('Mini 4')) {

      specs.push({

        lens_id: lens.id,

        focal_length: '24mm',

        max_aperture: 'f/1.7',

        mount: null,

        sensor_format: '1/1.3-inch CMOS',

        image_stabilization: true
      })
    }
  }

  await prisma.lensSpec.createMany({

    data: specs,

    skipDuplicates: true
  })

  console.log(`✅ Seeded ${specs.length} lens specs successfully!`)
}