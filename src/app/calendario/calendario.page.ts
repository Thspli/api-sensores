import { Component, OnInit } from '@angular/core';
import { Api } from '../api';
import { CalendarOptions, EventClickArg, DateClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.page.html',
  styleUrls: ['./calendario.page.scss'],
  standalone: false
})
export class CalendarioPage implements OnInit {

  public dadosDia: any[] = [];
  public carregando: boolean = false;
  public dataSelecionada: string = '';
  public mostrarDetalhes: boolean = false;
  public animacaoAtiva: boolean = false;

  // Configurações do FullCalendar
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: ptBrLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    buttonText: {
      today: 'Hoje'
    },
    height: 'auto',
    events: [], // Será preenchido com dados da API
    dateClick: this.handleDateClick.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventDisplay: 'block',
    displayEventTime: false,
    fixedWeekCount: false,
    showNonCurrentDates: true,
    dayMaxEvents: 2, // Limita a 2 eventos por dia
    moreLinkText: 'mais',
    // Estilo dos eventos
    eventClassNames: 'custom-event',
    dayCellClassNames: 'custom-day-cell'
  };

  constructor(private apiService: Api) {}

  ngOnInit() {
    setTimeout(() => {
      this.animacaoAtiva = true;
    }, 100);
    
    // Carregar eventos mockados para demonstração
    // Substitua isso pela chamada real à sua API
    this.carregarEventosMockados();
  }

  // MÉTODO MOCKADO - Substitua pela sua API real
  carregarEventosMockados() {
    // Simula dados de registros nos últimos 30 dias
    const eventos = [];
    const hoje = new Date();
    
    for (let i = 0; i < 30; i++) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - i);
      const dataStr = data.toISOString().split('T')[0];
      
      // Quantidade aleatória de registros (1-15)
      const quantidade = Math.floor(Math.random() * 15) + 1;
      
      // Cor baseada na quantidade
      let cor = '#10b981'; // Verde (poucos)
      if (quantidade > 10) cor = '#ef4444'; // Vermelho (muitos)
      else if (quantidade > 5) cor = '#fb923c'; // Laranja (médio)
      
      eventos.push({
        date: dataStr,
        title: `${quantidade} registro${quantidade !== 1 ? 's' : ''}`,
        backgroundColor: cor,
        borderColor: cor,
        extendedProps: {
          quantidade: quantidade
        }
      });
    }
    
    this.calendarOptions.events = eventos;
  }

  // MÉTODO PARA INTEGRAÇÃO COM API REAL
  // Descomente e adapte quando sua API estiver pronta
  /*
  carregarEventosDaAPI() {
    const mesAtual = new Date().toISOString().slice(0, 7); // "2024-12"
    
    // Endpoint que retorna contagem de registros por dia
    this.apiService.getRegistrosPorMes(mesAtual).subscribe({
      next: (response: any) => {
        this.calendarOptions.events = response.registros.map((r: any) => {
          // Definir cor baseada na quantidade
          let cor = '#10b981';
          if (r.quantidade > 10) cor = '#ef4444';
          else if (r.quantidade > 5) cor = '#fb923c';
          
          return {
            date: r.data,
            title: `${r.quantidade} registro${r.quantidade !== 1 ? 's' : ''}`,
            backgroundColor: cor,
            borderColor: cor,
            extendedProps: {
              quantidade: r.quantidade
            }
          };
        });
      },
      error: (err) => {
        console.error('Erro ao carregar eventos:', err);
      }
    });
  }
  */

  // Quando clicar em uma data
  handleDateClick(arg: DateClickArg) {
    console.log('Data clicada:', arg.dateStr);
    this.dataSelecionada = arg.dateStr;
    this.carregarDadosDoDia(arg.dateStr);
  }

  // Quando clicar em um evento (dia com registros)
  handleEventClick(arg: EventClickArg) {
    const data = arg.event.startStr;
    const quantidade = arg.event.extendedProps['quantidade'];
    
    console.log('Evento clicado:', data, 'Quantidade:', quantidade);
    this.dataSelecionada = data;
    this.carregarDadosDoDia(data);
  }

  // Carregar dados de um dia específico
  carregarDadosDoDia(data: string) {
    this.carregando = true;
    this.mostrarDetalhes = false;

    this.apiService.getDadosPorData(data).subscribe({
      next: (dados: any) => {
        this.dadosDia = dados;
        this.carregando = false;
        
        // Animar entrada dos resultados
        setTimeout(() => {
          this.mostrarDetalhes = true;
        }, 100);
      },
      error: (err: any) => {
        console.error('Erro ao carregar dados:', err);
        this.carregando = false;
        this.mostrarDetalhes = false;
      }
    });
  }

  formatarData(timestamp: string): string {
    if (!timestamp) return 'N/A';
    const data = new Date(timestamp);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatarDataTitulo(isoString: string): string {
    if (!isoString) return '';
    const data = new Date(isoString + 'T00:00:00');
    return data.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

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
      return valor.toLocaleString('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      });
    }
    return String(valor);
  }

  getIconePropriedade(chave: string): string {
    const chaveLower = chave.toLowerCase();
    if (chaveLower.includes('temperatura')) return 'thermometer-outline';
    if (chaveLower.includes('umidade')) return 'water-outline';
    if (chaveLower.includes('turbidez')) return 'contrast-outline';
    if (chaveLower.includes('ph')) return 'flask-outline';
    if (chaveLower.includes('cloro')) return 'beaker-outline';
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
      sensor: 'hardware-chip-outline',
      default: 'water-outline'
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
      sensor: 'secondary',
      default: 'tertiary'
    };
    return cores[tipo?.toLowerCase()] || cores.default;
  }

  // Método para obter estatísticas rápidas
  getEstatisticasRapidas(): any {
    if (this.dadosDia.length === 0) return null;

    const turbidezValores = this.dadosDia.map(d => d.turbidez).filter(v => v != null);
    const phValores = this.dadosDia.map(d => d.ph).filter(v => v != null);
    const cloroValores = this.dadosDia.map(d => d.cloro).filter(v => v != null);

    return {
      total: this.dadosDia.length,
      turbidezMedia: turbidezValores.length > 0 ? 
        (turbidezValores.reduce((a, b) => a + b, 0) / turbidezValores.length).toFixed(2) : 'N/D',
      phMedio: phValores.length > 0 ? 
        (phValores.reduce((a, b) => a + b, 0) / phValores.length).toFixed(2) : 'N/D',
      cloroMedio: cloroValores.length > 0 ? 
        (cloroValores.reduce((a, b) => a + b, 0) / cloroValores.length).toFixed(2) : 'N/D'
    };
  }

  // Limpar seleção
  limparSelecao() {
    this.dataSelecionada = '';
    this.dadosDia = [];
    this.mostrarDetalhes = false;
  }
}