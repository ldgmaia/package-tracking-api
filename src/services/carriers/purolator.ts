import { createClientAsync, BasicAuthSecurity } from 'soap'
import { resolve } from 'path'
import { existsSync } from 'fs'

export async function trackPurolator(trackingCode: string) {
  const KEY = process.env.PUROLATOR_API_KEY
  const PASSWORD = process.env.PUROLATOR_API_SECRET
  const SERVICE_URL = process.env.PUROLATOR_BASE_URL

  let WSDL_URL: string

  const prodPath = resolve(
    __dirname,
    'services',
    'carriers',
    'TrackingService.wsdl'
  )
  const devPath = resolve(__dirname, 'TrackingService.wsdl')

  if (existsSync(prodPath)) {
    WSDL_URL = prodPath
  } else {
    WSDL_URL = devPath
  }
  try {
    const client = await createClientAsync(WSDL_URL, {
      endpoint: `${SERVICE_URL}/PWS/V1/Tracking/TrackingService.asmx`,
    })

    // 🔐 Set Basic Auth for your dev credentials
    client.setSecurity(new BasicAuthSecurity(KEY, PASSWORD))

    // 🧾 Set the SOAP Header (RequestContext) — required by Purolator
    const soapHeader = {
      RequestContext: {
        Version: '1.2',
        Language: 'en',
        GroupID: 'MyGroup', // arbitrary ID
        RequestReference: 'NodeJS Test',
      },
    }
    client.addSoapHeader(
      soapHeader,
      '',
      'ns1',
      'http://purolator.com/pws/datatypes/v1'
    )

    // 📦 Define the PIN(s) you want to track
    const args = {
      PINs: {
        PIN: {
          Value: trackingCode,
        },
      },
    }

    // 🚀 Make the request
    const [result] = await client.TrackPackagesByPinAsync(args)

    const lastUpdate = result.TrackingInformationList.TrackingInformation.at(
      0
    ).Scans.Scan.find((scan) => scan.ScanType === 'Delivery')
      ? result.TrackingInformationList.TrackingInformation.at(
          0
        ).Scans.Scan.find((scan) => scan.ScanType === 'Delivery').Description
      : result.TrackingInformationList.TrackingInformation.at(
          0
        ).Scans.Scan.find((scan) => scan.ScanType === 'Other').Description

    return {
      status: lastUpdate || 'unknown',
      details: result,
    }
  } catch (error: unknown) {
    console.error(error)
    return {
      status: 'error',
      details: error instanceof Error ? error.message : String(error),
    }
  }
}
