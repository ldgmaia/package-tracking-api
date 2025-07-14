import { env } from '@/env'
import { parseStringPromise } from 'xml2js'

interface CanadaPostTrackingResult {
  status: string
  details: unknown
}

export async function trackCanadaPost(
  trackingCode: string
): Promise<CanadaPostTrackingResult> {
  const key = env.CANADAPOST_API_KEY
  const password = env.CANADAPOST_API_SECRET
  const baseUrl = env.CANADAPOST_BASE_URL

  if (!key || !password || !baseUrl) {
    throw new Error('Missing Canada Post configuration')
  }

  const credentials = Buffer.from(`${key}:${password}`).toString('base64')
  const url = `${baseUrl}/track/pin/${trackingCode}/detail`

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${credentials}`,
      // 'Accept': 'application/xml'
    },
  })
  if (!res.ok) {
    throw new Error('Tracking code not found')
  }
  const xml = await res.text()
  let status = 'Unknown'
  let details: unknown = xml
  // Parse XML to extract the latest event description
  try {
    const result = await parseStringPromise(xml, { explicitArray: false })
    if (
      result &&
      result['tracking-detail'] &&
      result['tracking-detail']['significant-events']
    ) {
      const events = result['tracking-detail']['significant-events'].occurrence
      if (Array.isArray(events) && events.length > 0) {
        status = events[0]['event-description'] || 'Unknown'
      } else if (events && events['event-description']) {
        status = events['event-description']
      }
      details = result
    } else {
      status = 'Unknown'
    }
  } catch {
    // If parsing fails, keep details as raw XML and status as 'Unknown'
    status = 'Unknown'
  }
  return {
    status,
    details,
  }
}
