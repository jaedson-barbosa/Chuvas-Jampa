import { IEstacaoDetalhada, GetMedicao } from "./estacao"
import { GerenciadorCores } from "./cores"

export class ContextoGeral
{
    private _pronto: boolean
    get pronto() { return this._pronto }
    set pronto(value) {
        this._pronto = value
        sessionStorage.setItem('pronto', value ? ' ' : '')
    }

    private _imagemChuvas: string
    get imagemChuvas() { return this._imagemChuvas }
    set imagemChuvas(value) {
        this._imagemChuvas = value
        sessionStorage.setItem('imagemChuvas', value)
    }

    private _estacoes: IEstacaoDetalhada[]
    get estacoes() { return this._estacoes }
    set estacoes(value) {
        this._estacoes = value
        sessionStorage.setItem('estacoes', JSON.stringify(value))
    }

    private _ultimaAtualizacao: number
    get ultimaAtualizacao() { return this._ultimaAtualizacao }
    set ultimaAtualizacao(value) {
        this._ultimaAtualizacao = value
        sessionStorage.setItem('ultimaAtualizacao', value.toString())
    }

    private _cores: GerenciadorCores
    get cores() { return this._cores }
    set cores(value) {
        this._cores = value
        sessionStorage.setItem('cores', JSON.stringify(value))
    }

    private _escalaTempo: number
    get escalaTempo () { return this._escalaTempo }

    private _paletaCor: number
    get paletaCor () { return this._paletaCor }

    constructor(carregarPropsMain: boolean = true) {
        if (carregarPropsMain) {
            this._pronto = !!sessionStorage.getItem('pronto')
            this._imagemChuvas = sessionStorage.getItem('imagemChuvas')
            this._estacoes = JSON.parse(sessionStorage.getItem('estacoes'))
            this._ultimaAtualizacao = Number(sessionStorage.getItem('ultimaAtualizacao'))
            this._cores = JSON.parse(sessionStorage.getItem('cores'))
        }

        const _escalaTempo = Number(localStorage.getItem('escalaTempo') ?? 1)
        this._escalaTempo = _escalaTempo === 1 || _escalaTempo === 3 || _escalaTempo === 12 || _escalaTempo === 24 ? _escalaTempo : _escalaTempo
        this._paletaCor = Number(localStorage.getItem('paletaCor') ?? 0)
    }

    CalcularChuva(lat: number, lon: number): number {
        function Haversine(lat1: number, lon1: number) {
            function radians(graus: number): number { return graus * (Math.PI / 180); }
            return 6372.8 * 2 * Math.asin(Math.sqrt(Math.sin(radians(lat - lat1) / 2) ** 2 + Math.cos(radians(lat1)) * Math.cos(radians(lat)) * Math.sin(radians(lon - lon1) / 2) ** 2));
        }
        const pesos = this._estacoes.map(atual => 1 / Haversine(atual._latitude, atual._longitude) ** 2);
        return this._estacoes.reduce<number>((anterior, atual, i) => GetMedicao(atual, this._escalaTempo) * pesos[i] + anterior, 0) / pesos.reduce<number>((anterior, atual) => atual + anterior, 0);
    }
}