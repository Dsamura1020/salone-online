import type { PrismaClient } from "@prisma/client";
import { CITIES_BY_DISTRICT } from "./data/us-cities.data";
import { ALL_SL_DISTRICT_CODES, DISTRICT_NAMES } from "./data/us-regions";

const COUNTRY = "Sierra Leone";

function locationAddressLine1(city: string, districtName: string) {
  return `Seeded — ${city}, ${districtName}`;
}

export async function seedLocations(prisma: PrismaClient) {
  let created = 0;
  let skipped = 0;

  for (const districtCode of ALL_SL_DISTRICT_CODES) {
    const districtName = DISTRICT_NAMES[districtCode];
    const cities = CITIES_BY_DISTRICT[districtCode];

    if (!cities?.length) {
      console.warn(`  ⚠ No cities defined for ${districtCode}; skipping`);
      continue;
    }

    const uniqueCities = [...new Set(cities)];

    for (const city of uniqueCities) {
      const addressLine1 = locationAddressLine1(city, districtName);

      const existing = await prisma.location.findFirst({
        where: {
          country: COUNTRY,
          stateProvince: districtCode,
          city,
          addressLine1,
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.location.create({
        data: {
          country: COUNTRY,
          stateProvince: districtCode,
          city,
          addressLine1,
          district: null,
        },
      });
      created++;
    }
  }

  const total = await prisma.location.count({
    where: { country: COUNTRY },
  });

  console.log(
    `  ✓ Locations (${created} created, ${skipped} skipped, ${total} total Sierra Leone rows)`,
  );
}
