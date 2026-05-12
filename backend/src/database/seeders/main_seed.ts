import { seedUsers } from './user_seed'
import { seedCategories } from './category_seed'
import { seedWallets } from './wallet_seed'
import { seedLensListings } from './lenslisting'
import { seedLensSpecs } from './lenspec_seed'
import { seedLensImages } from './lensImage_seed'

async function main() {

  console.log('START SEEDING DATABASE...\n')

  //await seedUsers()
  //await seedCategories()
  //await seedWallets()
  //await seedLensListings()
  //await seedLensSpecs()
  await seedLensImages()

  console.log('\nALL SEED COMPLETED!')
}

main()
  .catch((e) => {
    console.error('SEED ERROR:', e)
    process.exit(1)
  })