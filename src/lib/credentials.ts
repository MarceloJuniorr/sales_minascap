import path from "path";

const options = {
    sandbox: process.env.EFI_SANDBOX ? true : false,
    client_id: process.env.EFI_CLIENT_ID!,
    client_secret: process.env.EFI_CLIENT_SECRET!,
    certificate: path.resolve(process.cwd(), process.env.EFI_CERTIFICATE_PATH!),
  }

export default options