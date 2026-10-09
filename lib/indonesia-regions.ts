import "server-only"

const REGION_API_URL = "https://wilayah.id/api"
const REGION_CACHE_SECONDS = 60 * 60 * 24 * 7

export type IndonesiaRegion = {
  code: string
  name: string
}

type RegionResponse = {
  data?: IndonesiaRegion[]
}

async function fetchRegions(path: string, tag: string): Promise<IndonesiaRegion[]> {
  const response = await fetch(`${REGION_API_URL}/${path}`, {
    cache: "force-cache",
    next: {
      revalidate: REGION_CACHE_SECONDS,
      tags: [tag],
    },
  })

  if (!response.ok) {
    throw new Error(`Gagal mengambil data wilayah (${response.status})`)
  }

  const result = (await response.json()) as RegionResponse
  return (result.data ?? [])
    .filter((region) => region.code && region.name)
    .map((region) => ({
      ...region,
      name: region.name.trim().replace(/^Kabupaten\s+/i, ""),
    }))
}

export function getProvinces() {
  return fetchRegions("provinces.json", "indonesia-provinces")
}

export function getRegencies(provinceCode: string) {
  return fetchRegions(
    `regencies/${provinceCode}.json`,
    `indonesia-regencies-${provinceCode}`,
  )
}
