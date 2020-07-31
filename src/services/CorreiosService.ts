var soap = require('soap')

const URL = process.env.CORREIOS_URL;

var params = {
    nCdEmpresa: process.env.N_CD_EMPRESA,
    sDsSenha: process.env.S_DS_SENHA,
    nCdServico: process.env.N_CD_SERVICO,
    sCepOrigem: process.env.S_CEP_ORIGEM,
    sCepDestino: '00000000',
    nVlPeso: process.env.N_VL_PESO,
    nCdFormato: Number(process.env.N_CD_FORMATO),
    nVlComprimento: Number(process.env.N_VL_COMPRIMENTO),
    nVlAltura: Number(process.env.N_VL_ALTURA),
    nVlLargura: Number(process.env.N_VL_LARGURA),
    nVlDiametro: Number(process.env.N_VL_DIAMETRO),
    sCdMaoPropria: process.env.S_CD_MAO_PROPRIA,
    nVlValorDeclarado: Number(process.env.N_VL_VALOR_DECLARADO),
    sCdAvisoRecebimento: process.env.S_CD_AVISO_RECEBIMENTO,
}

class CorreiosService {
    async getFretesByCep(cep: string, cb: (servicos: any) => void) {
        if (cep === '') return;
        try {
            return await soap.createClient(URL, async(err: any, client: any) => {
                if (err) {
                    throw `ERRO CONNECT CORREIOS SERVICE: ${err}`;
                }
                params.sCepDestino = cep;

                try {
                    return await client.CalcPrecoPrazo(params, function (err: any, result: any) {
                        if (err) {
                            throw `ERROR CALC_PRECO_PRAZO CORREIOS SERVICE: ${err}`;
                        }
                        const servicos = result.CalcPrecoPrazoResult.Servicos.cServico;
                        cb(servicos);
                    });
                } catch (error) {
                    throw error;
                }
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