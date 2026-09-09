import express from 'express'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.use(requireAuth)

router.get('/reverse-geocode', async (req, res) => {
  try {
    const { lat, lng } = req.query
    const latitude = parseFloat(lat)
    const longitude = parseFloat(lng)

    if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ success: false, error: 'Invalid latitude or longitude parameters.' })
    }

    // 1. Fetch BigDataCloud high-accuracy location & exact pincode (free, no API key needed)
    let bdcData = null
    try {
      const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      const bdcRes = await fetch(bdcUrl)
      if (bdcRes.ok) {
        bdcData = await bdcRes.json()
      }
    } catch (e) {
      console.warn('BigDataCloud geocode fetch failed:', e.message)
    }

    // 2. Fetch OpenStreetMap Nominatim for street/building level details
    let osmData = null
    try {
      const osmUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&zoom=18`
      const osmRes = await fetch(osmUrl, {
        headers: {
          'User-Agent': 'LaboratoryTestReportApp/1.0 (internal-lab-app)',
          'Accept-Language': 'en',
        },
      })
      if (osmRes.ok) {
        osmData = await osmRes.json()
      }
    } catch (e) {
      console.warn('OSM Nominatim geocode fetch failed:', e.message)
    }

    const parts = []
    const add = (val) => {
      if (val && typeof val === 'string') {
        const trimmed = val.trim()
        if (trimmed && !parts.some((p) => p.toLowerCase() === trimmed.toLowerCase())) {
          parts.push(trimmed)
        }
      }
    }

    // Add building and street level details from OSM
    if (osmData) {
      if (osmData.name) add(osmData.name)
      if (osmData.address) {
        add(osmData.address.building || osmData.address.office || osmData.address.amenity || osmData.address.commercial || osmData.address.industrial)
        add(osmData.address.house_number ? `${osmData.address.house_number} ${osmData.address.road || ''}`.trim() : (osmData.address.road || osmData.address.pedestrian))
        add(osmData.address.neighbourhood || osmData.address.residential || osmData.address.suburb || osmData.address.village)
      }
    }

    // Add locality/suburb and city
    if (bdcData) {
      add(bdcData.locality)
      add(bdcData.city)
      add(bdcData.principalSubdivision)
    } else if (osmData?.address) {
      add(osmData.address.city_district || osmData.address.subdistrict || osmData.address.locality)
      add(osmData.address.city || osmData.address.town || osmData.address.municipality || osmData.address.county)
      add(osmData.address.state || osmData.address.region)
    }

    // Add exact postal code (prefer BigDataCloud for exact pincode)
    const exactPostcode = bdcData?.postcode || osmData?.address?.postcode
    if (exactPostcode) {
      add(exactPostcode)
    }

    // Add country
    add(bdcData?.countryName || osmData?.address?.country)

    let formattedAddress = parts.join(', ')

    if (!formattedAddress) {
      formattedAddress = osmData?.display_name || bdcData?.locality || `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`
    }

    // Pincode fallback fix for Kharadi / EON / Zensar area
    if (/kharadi|zensar|rakshak|eon/i.test(formattedAddress)) {
      formattedAddress = formattedAddress.replace(/\b411001\b/g, '411014')
    }

    res.json({ success: true, data: { address: formattedAddress, raw: { osm: osmData, bdc: bdcData } } })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || 'Failed to reverse geocode location.' })
  }
})

export default router
