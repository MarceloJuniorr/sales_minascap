import path from "path";

const options = {
    sandbox: true,
    client_id: process.env.EFI_CLIENT_ID!,
    client_secret: process.env.EFI_CLIENT_SECRET!,
    certificate: path.resolve(process.cwd(), process.env.EFI_CERTIFICATE_PATH!),
  }

export default options