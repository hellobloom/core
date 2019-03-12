const fs = require("fs")
interface IAttestation {
  requester: string
  attester: string
  subject: string
  dataHash: string
}
export const parseBatchAttestations = async (filePath: string) => {
  const fileContents = fs.readFileSync(filePath)
  const lines = fileContents.toString().split("\n")
  const firstLine = lines[0]
  const dataLines = lines.slice(1, lines.length - 1)
  const dataParsed: IAttestation[] = dataLines.map((line: string) =>
    firstLine.split(",").reduce((curr: any, next: any, index: any) => ({ ...curr, [next]: line.split(",")[index] }), {})
  )
  const dataFormatted = {
    requesters: dataParsed.map(a => a.requester),
    attesters: dataParsed.map(a => a.attester),
    subjects: dataParsed.map(a => a.subject),
    dataHashes: dataParsed.map(a => a.dataHash),
  }
  return dataFormatted
}
