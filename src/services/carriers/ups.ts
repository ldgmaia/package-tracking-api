import { env } from '@/env'
import { prisma } from '@/lib/prisma'

interface UPSTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface UPSTrackingResponse {
  trackResponse: TrackResponse
}

export interface TrackResponse {
  shipment: Shipment[]
}

export interface Shipment {
  inquiryNumber: string
  shipmentType: string
  shipperNumber: string
  pickupDate: string
  package: Package[]
}

export interface Package {
  trackingNumber: string
  deliveryDate: DeliveryDate[]
  deliveryTime: DeliveryTime
  activity: Activity[]
  currentStatus: CurrentStatus
  packageAddress: PackageAddress[]
  weight: Weight
  service: Service
  referenceNumber: ReferenceNumber[]
  deliveryInformation: DeliveryInformation
  taxIndicator: string
  dimension: Dimension
  isSmartPackage: boolean
  packageCount: number
}

export interface DeliveryDate {
  type: string
  date: string
}

export interface DeliveryTime {
  type: string
  endTime: string
}

export interface Activity {
  location: Location
  status: Status
  date: string
  time: string
  gmtDate: string
  gmtOffset: string
  gmtTime: string
}

export interface Location {
  code?: string
  address: Address
  slic?: string
}

export interface Address {
  city?: string
  stateProvince?: string
  countryCode: string
  country: string
}

export interface Status {
  type: string
  description: string
  code: string
  statusCode: string
}

export interface CurrentStatus {
  description: string
  code: string
}

export interface PackageAddress {
  type: string
  address: Address2
}

export interface Address2 {
  city: string
  stateProvince: string
  countryCode: string
  country: string
}

export interface Weight {
  unitOfMeasurement: string
  weight: string
}

export interface Service {
  code: string
  levelCode: string
  description: string
}

export interface ReferenceNumber {
  type: string
  number: string
  code: string
  description: string
}

export interface DeliveryInformation {
  location: string
  deliveryPhoto: DeliveryPhoto
  pod: Pod
}

export interface DeliveryPhoto {
  photoCaptureInd: string
  photoDispositionCode: string
  isNonPostalCodeCountry: boolean
  isProximityMapViewable: boolean
}

export interface Pod {
  content: string
}

export interface Dimension {
  height: string
  length: string
  width: string
  unitOfDimension: string
}

async function getUPSToken(): Promise<string> {
  // Check for valid token in database
  const storedToken = await prisma.uPSToken.findUnique({
    where: { id: 'ups' },
  })

  if (storedToken && storedToken.expiresAt > new Date()) {
    return storedToken.accessToken
  }

  const baseUrl = env.UPS_BASE_URL
  const clientId = env.UPS_API_KEY
  const clientSecret = env.UPS_API_SECRET

  if (!baseUrl || !clientId || !clientSecret) {
    throw new Error('Missing UPS configuration')
  }

  try {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
      'base64'
    )
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
    })
    const res = await fetch(`${baseUrl}/security/v1/oauth/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })
    if (!res.ok) {
      throw new Error(
        `UPS token request failed: ${res.status} ${res.statusText}`
      )
    }
    const response = (await res.json()) as UPSTokenResponse
    const expiresAt = new Date(Date.now() + (response.expires_in - 300) * 1000)
    await prisma.uPSToken.upsert({
      where: { id: 'ups' },
      create: {
        id: 'ups',
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
      throw new Error(`Failed to get UPS token: ${error.message}`)
    }
    throw error
  }
}

export async function trackUPS(trackingCode: string) {
  try {
    const baseUrl = env.UPS_BASE_URL
    if (!baseUrl) {
      throw new Error('Missing UPS configuration')
    }
    const token = await getUPSToken()
    const url = `${baseUrl}/api/track/v1/details/${trackingCode}?locale=en_US&returnSignature=false&returnPOD=true`
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        transId: 'RBMS',
        transactionSrc: 'RBMS',
        'Content-Type': 'application/json',
      },
    })
    // const resText = await res.json()
    // console.log('resText ', resText)
    if (!res.ok) {
      throw new Error(
        `UPS tracking request failed: ${res.status} ${res.statusText}`
      )
    }
    const response = (await res.json()) as UPSTrackingResponse
    const lastUpdate =
      response?.trackResponse?.shipment?.[0]?.package?.[0]?.currentStatus
        ?.description
    return {
      status: lastUpdate || 'unknown',
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to track UPS package: ${error.message}`)
    }
    throw error
  }
}
