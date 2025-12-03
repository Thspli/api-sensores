import { Component, OnInit } from '@angular/core';
import { Api } from '../api';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import { DateClickArg } from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';

interface EventoCalendario {
  date: string;
  title: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    quantidade: number;
  };
}

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
    events: [],
    dateClick: this.handleDateClick.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventDisplay: 'block',
    displayEventTime: false,
    fixedWeekCount: false,
    showNonCurrentDates: true,
    dayMaxEvents: 2,
    moreLinkText: 'mais',
    eventClassNames: 'custom-event',
    dayCellClassNames: 'custom-day-cell',
    // Melhorias adicionais
    weekends: true,
    editable: false,
    selectable: true,
    selectMirror: true,
    navLinks: false,
    eventColor: '#3b82f6'
  };

  constructor(private apiService: Api) {}

  ngOnInit() {
    setTimeout(() => {
      this.animacaoAtiva = true;
    }, 100);
    
    // Carregar eventos reais da API
    this.carregarEventosDaAPI();
  }

  // MÉTODO PARA INTEGRAÇÃO COM API REAL
  carregarEventosDaAPI() {
    // Opção 1: Se sua API retorna todos os dados e você quer contar por dia
    this.apiService.getSensores().subscribe({
      next: (dados: any[]) => {
        const eventosPorData = this.processarDadosParaCalendario(dados);
        this.calendarOptions.events = eventosPorData;
        console.log('Eventos carregados:', eventosPorData);
      },
      error: (err) => {
        console.error('Erro ao carregar eventos:', err);
        // Fallback para dados mockados em caso de erro
        this.carregarEventosMockados();
      }
    });
  }

  // Processar dados da API para formato do calendário
  processarDadosParaCalendario(dados: any[]): EventoCalendario[] {
    // Agrupar dados por data
    const dadosPorData: { [key: string]: number } = {};
    
    dados.forEach(item => {
      // Extrair a data do timestamp (formato: YYYY-MM-DD)
      const timestamp = item.timestamp || item.data;
      if (timestamp) {
        const data = new Date(timestamp).toISOString().split('T')[0];
        dadosPorData[data] = (dadosPorData[data] || 0) + 1;
      }
    });

    // Converter para formato de eventos do FullCalendar
    const eventos: EventoCalendario[] = Object.entries(dadosPorData).map(([data, quantidade]) => {
      // Definir cor baseada na quantidade
      let cor = '#10b981'; // Verde (poucos)
      if (quantidade > 10) cor = '#ef4444'; // Vermelho (muitos)
      else if (quantidade > 5) cor = '#fb923c'; // Laranja (médio)

      return {
        date: data,
        title: `${quantidade} registro${quantidade !== 1 ? 's' : ''}`,
        backgroundColor: cor,
        borderColor: cor,
        extendedProps: {
          quantidade: quantidade
        }
      };
    });

    return eventos;
  }

  // MÉTODO MOCKADO - Usar apenas para testes
  carregarEventosMockados() {
    const eventos: EventoCalendario[] = [];
    const hoje = new Date();
    
    for (let i = 0; i < 30; i++) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - i);
      const dataStr = data.toISOString().split('T')[0];
      
      const quantidade = Math.floor(Math.random() * 15) + 1;
      
      let cor = '#10b981';
      if (quantidade > 10) cor = '#ef4444';
      else if (quantidade > 5) cor = '#fb923c';
      
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
        this.dadosDia = Array.isArray(dados) ? dados : [];
        this.carregando = false;
        
        setTimeout(() => {
          this.mostrarDetalhes = true;
        }, 100);
        
        console.log('Dados do dia carregados:', this.dadosDia);
      },
      error: (err: any) => {
        console.error('Erro ao carregar dados:', err);
        this.carregando = false;
        this.mostrarDetalhes = false;
        this.dadosDia = [];
      }
    });
  }

  // Recarregar eventos do calendário
  recarregarEventos() {
    this.carregarEventosDaAPI();
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
    const camposPadrao = ['id', '_id', 'nome', 'tipo', 'localizacao', 'timestamp', 'data', 'status', 'unidade', 'valor', 'turbidez', 'ph', 'cloro', 'nivel_agua'];
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

  limparSelecao() {
    this.dataSelecionada = '';
    this.dadosDia = [];
    this.mostrarDetalhes = false;
  }
}