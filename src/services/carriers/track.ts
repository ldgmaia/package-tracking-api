import { trackPurolator } from './purolator'
import { trackFedex } from './fedex'
import { trackUPS } from './ups'
import { trackDHL } from './dhl'
import { trackCanadaPost } from './canadapost'

export async function trackPackage(carrier: string, trackingCode: string) {
  switch (carrier.toLowerCase()) {
    case 'purolator':
      return trackPurolator(trackingCode)
    case 'canadapost':
      return trackCanadaPost(trackingCode)
    case 'fedex':
      return trackFedex(trackingCode)
    case 'ups':
      return trackUPS(trackingCode)
    case 'dhl':
      return trackDHL(trackingCode)
    default:
      throw new Error('Unsupported carrier')
  }
}
