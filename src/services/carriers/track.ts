// import { trackFedex } from './fedex'
// import { trackUPS } from './ups'
// import { trackDHL } from './dhl'

import { trackPurolator } from './purolator'

export async function trackPackage(carrier: string, trackingCode: string) {
  switch (carrier.toLowerCase()) {
    case 'purolator':
      return trackPurolator(trackingCode)
    // case 'fedex':
    //   return trackFedex(trackingCode)
    // case 'ups':
    //   return trackUPS(trackingCode)
    // case 'dhl':
    //   return trackDHL(trackingCode)
    default:
      throw new Error('Unsupported carrier')
  }
}
