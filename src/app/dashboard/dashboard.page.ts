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
  public registroMaisRecente: any = null;
  public outrosRegistros: any[] = [];
  public registroExpandido: number | null = null;
  public registroColapsando: number | null = null;
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
            this.processarDados(data);
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
        this.processarDados(data);
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

  // Processar dados: separar o mais recente dos outros
  processarDados(data: any[]): void {
    this.dadosSensores = data;
    
    if (data && data.length > 0) {
      // Ordenar por timestamp (mais recente primeiro)
      const dadosOrdenados = [...data].sort((a, b) => {
        const dataA = new Date(a.timestamp || a.data).getTime();
        const dataB = new Date(b.timestamp || b.data).getTime();
        return dataB - dataA; // Decrescente (mais recente primeiro)
      });

      // Separar o mais recente
      this.registroMaisRecente = dadosOrdenados[0];
      this.outrosRegistros = dadosOrdenados.slice(1);
    } else {
      this.registroMaisRecente = null;
      this.outrosRegistros = [];
    }
  }

  // Toggle expansão de um registro
  toggleRegistro(index: number): void {
    if (this.registroExpandido === index) {
      // Se clicar no registro já expandido, colapsar com animação
      this.registroColapsando = index;
      setTimeout(() => {
        this.registroExpandido = null;
        this.registroColapsando = null;
      }, 300); // Tempo da animação
    } else {
      // Se já houver outro registro expandido, colapsar primeiro
      if (this.registroExpandido !== null) {
        this.registroColapsando = this.registroExpandido;
        setTimeout(() => {
          this.registroExpandido = index;
          this.registroColapsando = null;
        }, 300);
      } else {
        // Se nenhum registro estiver expandido, expandir imediatamente
        this.registroExpandido = index;
      }
    }
  }

  // Verificar se registro está expandido
  isExpandido(index: number): boolean {
    return this.registroExpandido === index;
  }

  // Verificar se registro está colapsando
  isColapsando(index: number): boolean {
    return this.registroColapsando === index;
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

  getValorSensor(sensor: any, propriedade: string): any {
    return sensor[propriedade] || 'N/A';
  }

  formatarData(timestamp: string): string {
    if (!timestamp) return 'N/A';
    const data = new Date(timestamp);
    return data.toLocaleString('pt-BR');
  }

  formatarDataCompacta(timestamp: string): string {
    if (!timestamp) return 'N/A';
    const data = new Date(timestamp);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getPropriedadesCustomizadas(sensor: any): Array<{chave: string, valor: any}> {
    const camposPadrao = ['id', '_id', 'nome', 'tipo', 'localizacao', 'timestamp', 'data', 'status', 'unidade', 'valor', 'turbidez', 'ph', 'nivel_agua', 'umidade_terra'];
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

  formatarNomePropriedade(chave: string): string {
    return chave
      .split('_')
      .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(' ');
  }

  formatarValorPropriedade(valor: any): string {
    if (typeof valor === 'boolean') {
      return valor ? 'Ativo' : 'Inativo';
    }
    if (typeof valor === 'number') {
      return valor.toLocaleString('pt-BR');
    }
    return String(valor);
  }

  getIconePropriedade(chave: string): string {
    const chaveLower = chave.toLowerCase();
    if (chaveLower.includes('temperatura')) return 'thermometer-outline';
    if (chaveLower.includes('umidade') && chaveLower.includes('terra')) return 'leaf-outline';
    if (chaveLower.includes('umidade')) return 'water-outline';
    if (chaveLower.includes('turbidez')) return 'contrast-outline';
    if (chaveLower.includes('ph')) return 'flask-outline';
    if (chaveLower.includes('bomba')) return 'settings-outline';
    if (chaveLower.includes('pressao')) return 'speedometer-outline';
    if (chaveLower.includes('nivel')) return 'analytics-outline';
    if (chaveLower.includes('status')) return 'checkmark-circle-outline';
    return 'information-circle-outline';
  }

  getCorPropriedade(valor: any): string {
    if (typeof valor === 'boolean') {
      return valor ? 'success' : 'danger';
    }
    return 'primary';
  }

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