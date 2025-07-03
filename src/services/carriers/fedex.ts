import { env } from '@/env'
import { prisma } from '@/lib/prisma'

interface FedExTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface FedExTrackingResponse {
  output: {
    completeTrackResults: Array<{
      trackResults: Array<{
        latestStatusDetail: {
          code: string
          statusByLocale: string
          description: string
        }
        dateAndTimes: Array<{
          type: string
          dateTime: string
        }>
        scanEvents: Array<{
          date: string
          eventType: string
          eventDescription: string
          scanLocation: {
            city: string
            stateOrProvinceCode: string
            countryCode: string
          }
        }>
        serviceDetail: {
          type: string
          description: string
        }
        packageDetails: {
          packagingDescription: {
            type: string
            description: string
          }
          weight: {
            units: string
            value: number
          }
        }
      }>
    }>
  }
}

async function getFedExToken(): Promise<string> {
  // Check for valid token in database
  const storedToken = await prisma.fedExToken.findUnique({
    where: { id: 'fedex' },
  })

  // If token exists and is not expired, return it
  if (storedToken && storedToken.expiresAt > new Date()) {
    return storedToken.accessToken
  }

  // Otherwise, get new token
  const baseUrl = env.FEDEX_BASE_URL
  const clientId = env.FEDEX_API_KEY
  const clientSecret = env.FEDEX_API_SECRET

  if (!baseUrl || !clientId || !clientSecret) {
    throw new Error('Missing FedEx configuration')
  }

  try {
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    })

    const res = await fetch(`${baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })
    if (!res.ok) {
      throw new Error(
        `FedEx token request failed: ${res.status} ${res.statusText}`
      )
    }
    const response = (await res.json()) as FedExTokenResponse

    // Calculate expiration date (subtract 5 minutes for safety margin)
    const expiresAt = new Date(Date.now() + (response.expires_in - 300) * 1000)

    // Store token in database
    await prisma.fedExToken.upsert({
      where: { id: 'fedex' },
      create: {
        id: 'fedex',
        accessToken: response.access_token,
        expiresAt,
      },
      update: {
        accessToken: response.access_token,
        expiresAt,
      },
    })

    return response.access_token
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get FedEx token: ${error.message}`)
    }
    throw error
  }
}

interface TrackingResult {
  status: string
  details: {
    latestStatusDetail: {
      code: string
      statusByLocale: string
      description: string
    }
    dateAndTimes?: Array<{
      type: string
      dateTime: string
    }>
    scanEvents?: Array<{
      date: string
      eventType: string
      eventDescription: string
      scanLocation: {
        city: string
        stateOrProvinceCode: string
        countryCode: string
      }
    }>
    serviceDetail?: {
      type: string
      description: string
    }
  }
}

export async function trackFedex(
  trackingCode: string
): Promise<TrackingResult> {
  try {
    const baseUrl = env.FEDEX_BASE_URL
    if (!baseUrl) {
      throw new Error('Missing FedEx configuration')
    }

    const token = await getFedExToken()

    const res = await fetch(`${baseUrl}/track/v1/trackingnumbers`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trackingInfo: [
          {
            trackingNumberInfo: {
              trackingNumber: trackingCode,
            },
          },
        ],
        includeDetailedScans: true,
      }),
    })
    if (!res.ok) {
      throw new Error(
        `FedEx tracking request failed: ${res.status} ${res.statusText}`
      )
    }
    const response = (await res.json()) as FedExTrackingResponse

    // Extract relevant tracking information from response
    const trackInfo =
      response.output?.completeTrackResults?.[0]?.trackResults?.[0]
    if (!trackInfo) {
      throw new Error('No tracking information found')
    }

    return {
      status: trackInfo.latestStatusDetail?.statusByLocale || 'unknown',
      details: {
        latestStatusDetail: trackInfo.latestStatusDetail,
        dateAndTimes: trackInfo.dateAndTimes,
        scanEvents: trackInfo.scanEvents,
        serviceDetail: trackInfo.serviceDetail,
      },
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to track FedEx package: ${error.message}`)
    }
    throw error
  }
}
