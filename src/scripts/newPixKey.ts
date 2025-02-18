import EfiPay from "sdk-node-apis-efi";


const options = {
    sandbox: false,
    client_id: 'Client_Id',
    client_secret: 'Client',
    certificate: 'src/cert/producao.p12',
  }
  const efipay = new EfiPay(options);


// O método pixCreateEvp indica os campos que devem ser enviados e que serão retornados
efipay.pixCreateEvp()
	.then((resposta) => {
		console.log(resposta) // Aqui você tera acesso a resposta da API e os campos retornados de forma intuitiva
	})
	.catch((error) => {
		console.log(error)
	})