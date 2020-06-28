var soap = require('soap')

const URL = "http://ws.correios.com.br/calculador/CalcPrecoPrazo.asmx?wsdl";

var params = {
    nCdEmpresa: '08082650',
    sDsSenha: '564321',
    nCdServico: '04014,04510',//,04782,04790,04804', //SEDEX, PAC, SEDEX 12, SEDEX 10, SEDEX HOJE
    sCepOrigem: '27600000',
    sCepDestino: '35400000',
    nVlPeso: '1',
    nCdFormato: 1,
    nVlComprimento: 20.0,
    nVlAltura: 20.0,
    nVlLargura: 20.0,
    nVlDiametro: 0.0,
    sCdMaoPropria: 'n',
    nVlValorDeclarado: 0.0,
    sCdAvisoRecebimento: 'n',
}

class CorreiosService {
    async getFretesByCep(cep: string, cb: (servicos: any) => void) {
        if (cep === '') return;
        try {
            return await soap.createClient(URL, async(err: any, client: any) => {
                if (err) throw err;
                params.sCepDestino = cep;
                return await client.CalcPrecoPrazo(params, function (err: any, result: any) {
                    if (err) throw err;
                    const servicos = result.CalcPrecoPrazoResult.Servicos.cServico;
                    cb(servicos);
                });
            });            
        } catch (err) {
            throw err
        }
        
    }

    getNameService(code: number) {
        switch(code) {
            case 4014:
                return 'SEDEX';
            case 4510:
                return 'PAC'
            case 4782:
                return 'SEDEX 12';
            case 4790:
                return 'SEDEX 10';
            case 4804:
                return 'SEDEX HOJE'
        }
    }
}

export default CorreiosService;