import { createClientAsync, BasicAuthSecurity } from 'soap'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

export async function trackPurolator(trackingCode: string) {
  const KEY = process.env.PUROLATOR_API_KEY
  const PASSWORD = process.env.PUROLATOR_API_SECRET
  const SERVICE_URL = process.env.PUROLATOR_BASE_URL

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const WSDL_URL = resolve(__dirname, 'TrackingService.wsdl')

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

    return {
      status:
        result.TrackingInformationList.TrackingInformation.at(0).Scans.Scan.at(
          0
        ).Description || 'unknown',
      details: result,
    }
  } catch (error: any) {
    return {
      status: 'error',
      details: error.message || error,
    }
  }
}
