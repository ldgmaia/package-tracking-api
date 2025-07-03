import { env } from '@/env'

export interface DHLTrackingResponse {
  shipments: Shipment[]
}

export interface Shipment {
  shipmentTrackingNumber: string
  status: string
  shipmentTimestamp: string
  productCode: string
  description: string
  shipperDetails: ShipperDetails
  receiverDetails: ReceiverDetails
  totalWeight: number
  unitOfMeasurements: string
  shipperReferences: ShipperReference[]
  events: Event[]
  numberOfPieces: number
  estimatedDeliveryDate: string
}

export interface ShipperDetails {
  name: string
  postalAddress: PostalAddress
  serviceArea: ServiceArea[]
}

export interface PostalAddress {
  cityName: string
  postalCode: string
  provinceCode: string
  countryCode: string
}

export interface ServiceArea {
  code: string
  description: string
}

export interface ReceiverDetails {
  name: string
  postalAddress: PostalAddress2
  serviceArea: ServiceArea2[]
}

export interface PostalAddress2 {
  cityName: string
  postalCode: string
  provinceCode: string
  countryCode: string
}

export interface ServiceArea2 {
  code: string
  description: string
  facilityCode: string
}

export interface ShipperReference {
  value: string
  typeCode: string
}

export interface Event {
  date: string
  time: string
  typeCode: string
  description: string
  serviceArea: ServiceArea3[]
}

export interface ServiceArea3 {
  code: string
  description: string
}

export async function trackDHL(trackingCode: string) {
  const baseUrl = env.DHL_BASE_URL
  const apiKey = env.DHL_API_KEY
  const apiSecret = env.DHL_API_SECRET

  if (!baseUrl || !apiKey || !apiSecret) {
    throw new Error('Missing DHL configuration')
  }

  const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')
  const url = `${baseUrl}/shipments/${trackingCode}/tracking?trackingView=last-checkpoint`

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    throw new Error(
      `DHL tracking request failed: ${res.status} ${res.statusText}`
    )
  }
  const response = (await res.json()) as DHLTrackingResponse
  const lastUpdate =
    response?.shipments?.[0].events?.[0]?.description || 'unknown'
  return {
    status: lastUpdate || 'unknown',
  }
}
