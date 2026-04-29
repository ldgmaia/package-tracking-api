import { trackPurolator } from './purolator'
import { trackFedex } from './fedex'
import { trackUPS } from './ups'
import { trackDHL } from './dhl'
import { trackCanadaPost } from './canadapost'

export async function trackPackage(carrier: string, trackingCode: string) {
  let result
  switch (carrier.toLowerCase()) {
    case 'purolator':
      result = await trackPurolator(trackingCode)
      break
    case 'canadapost':
      result = await trackCanadaPost(trackingCode)
      break
    case 'fedex':
      result = await trackFedex(trackingCode)
      break
    case 'ups':
      result = await trackUPS(trackingCode)
      break
    case 'dhl':
      result = await trackDHL(trackingCode)
      break
    default:
      throw new Error('Unsupported carrier')
  }
  // Always return status and destinationCountry if present
  return {
    status: result.status,
    destinationCountry: result.destinationCountry || null,
  }
}
