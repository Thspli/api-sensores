import { Component, OnInit, OnDestroy } from '@angular/core';
import { Api } from '../api';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit, OnDestroy {

  public datetime!: string;
  public dadosSensores: any[] = [];
  public dadosHistorico: any[] = [];
  public ultimaAtualizacao?: Date;
  public dataMaxima: string = new Date().toISOString();
  
  // Controle do polling
  private pollingSubscription?: Subscription;
  private intervaloAtualizacao: number = 30000; // 30 segundos
  public atualizacaoAutomatica: boolean = true;
  public carregando: boolean = false;
  public carregandoHistorico: boolean = false;

  constructor(private apiService: Api) { }

  ngOnInit() {
    this.carregarDados();
    this.iniciarAtualizacaoAutomatica();
  }

  ngOnDestroy() {
    this.pararAtualizacaoAutomatica();
  }

  iniciarAtualizacaoAutomatica(): void {
    if (this.atualizacaoAutomatica) {
      this.pollingSubscription = interval(this.intervaloAtualizacao)
        .pipe(
          switchMap(() => this.apiService.getSensores())
        )
        .subscribe({
          next: (data) => {
            this.dadosSensores = data;
            this.ultimaAtualizacao = new Date();
            console.log('Dados atualizados automaticamente:', data);
          },
          error: (err) => {
            console.error('Erro na atualização automática:', err);
          }
        });
    }
  }

  pararAtualizacaoAutomatica(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = undefined;
    }
  }

  toggleAtualizacaoAutomatica(): void {
    this.atualizacaoAutomatica = !this.atualizacaoAutomatica;
    
    if (this.atualizacaoAutomatica) {
      this.iniciarAtualizacaoAutomatica();
    } else {
      this.pararAtualizacaoAutomatica();
    }
  }

  carregarDados(): void {
    this.carregando = true;
    this.apiService.getSensores().subscribe({
      next: (data) => {
        this.dadosSensores = data;
        this.ultimaAtualizacao = new Date();
        this.carregando = false;
        console.log('Dados carregados:', data);
      },
      error: (err) => {
        console.error('Erro ao carregar dados dos sensores', err);
        this.carregando = false;
      }
    });
  }

  carregarDadosPorData(dataSelecionada: string): void {
    if (!dataSelecionada) {
      console.warn('Nenhuma data selecionada');
      return;
    }

    this.carregandoHistorico = true;
    this.apiService.getDadosPorData(dataSelecionada).subscribe({
      next: (data) => {
        this.dadosHistorico = data;
        this.carregandoHistorico = false;
        console.log('Dados por data:', data);
      },
      error: (err) => {
        console.error('Erro ao carregar dados por data', err);
        this.carregandoHistorico = false;
      }
    });
  }

  // Método para extrair valor de propriedades dos sensores
  getValorSensor(sensor: any, propriedade: string): any {
    return sensor[propriedade] || 'N/A';
  }

  // Método para formatar timestamp
  formatarData(timestamp: string): string {
    if (!timestamp) return 'N/A';
    const data = new Date(timestamp);
    return data.toLocaleString('pt-BR');
  }

  // Método para obter propriedades customizadas do sensor (excluindo campos padrão)
  getPropriedadesCustomizadas(sensor: any): Array<{chave: string, valor: any}> {
    const camposPadrao = ['id', '_id', 'nome', 'tipo', 'localizacao', 'timestamp', 'data', 'status', 'unidade', 'valor'];
    const propriedades: Array<{chave: string, valor: any}> = [];
    
    Object.keys(sensor).forEach(chave => {
      if (!camposPadrao.includes(chave) && sensor[chave] !== null && sensor[chave] !== undefined) {
        propriedades.push({
          chave: this.formatarNomePropriedade(chave),
          valor: this.formatarValorPropriedade(sensor[chave])
        });
      }
    });
    
    return propriedades;
  }

  // Formatar nome da propriedade de snake_case para título
  formatarNomePropriedade(chave: string): string {
    return chave
      .split('_')
      .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(' ');
  }

  // Formatar valor da propriedade
  formatarValorPropriedade(valor: any): string {
    if (typeof valor === 'boolean') {
      return valor ? 'Ativo' : 'Inativo';
    }
    if (typeof valor === 'number') {
      return valor.toLocaleString('pt-BR');
    }
    return String(valor);
  }

  // Obter ícone para propriedade customizada
  getIconePropriedade(chave: string): string {
    const chaveLower = chave.toLowerCase();
    if (chaveLower.includes('temperatura')) return 'thermometer-outline';
    if (chaveLower.includes('umidade')) return 'water-outline';
    if (chaveLower.includes('bomba')) return 'settings-outline';
    if (chaveLower.includes('pressao')) return 'speedometer-outline';
    if (chaveLower.includes('nivel')) return 'analytics-outline';
    if (chaveLower.includes('status')) return 'checkmark-circle-outline';
    return 'information-circle-outline';
  }

  // Obter cor para propriedade customizada
  getCorPropriedade(valor: any): string {
    if (typeof valor === 'boolean') {
      return valor ? 'success' : 'danger';
    }
    return 'primary';
  }

  // Método para obter ícone baseado no tipo de sensor
  getIconeSensor(tipo: string): string {
    const icones: any = {
      temperatura: 'thermometer-outline',
      umidade: 'water-outline',
      pressao: 'speedometer-outline',
      luminosidade: 'sunny-outline',
      gas: 'cloud-outline',
      default: 'hardware-chip-outline'
    };
    return icones[tipo?.toLowerCase()] || icones.default;
  }

  // Método para obter cor baseada no tipo de sensor
  getCorSensor(tipo: string): string {
    const cores: any = {
      temperatura: 'danger',
      umidade: 'primary',
      pressao: 'warning',
      luminosidade: 'warning',
      gas: 'medium',
      default: 'tertiary'
    };
    return cores[tipo?.toLowerCase()] || cores.default;
  }

  mostrarData(): void {
    console.log(this.datetime);
  }
}