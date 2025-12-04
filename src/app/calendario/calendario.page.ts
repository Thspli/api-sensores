import { Component, OnInit } from '@angular/core';
import { Api } from '../api';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import { DateClickArg } from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { DataNormalizer } from '../utils/data-normalizer'; // IMPORTAR

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
    
    this.carregarEventosDaAPI();
  }

  carregarEventosDaAPI() {
    console.log('🔍 Buscando dados da API...');
    
    this.apiService.getSensores().subscribe({
      next: (dados: any[]) => {
        console.log('✅ Dados recebidos da API:', dados);
        
        if (dados && dados.length > 0) {
          // ✅ NORMALIZAR OS DADOS ANTES DE PROCESSAR
          const dadosNormalizados = DataNormalizer.normalizarRegistros(dados);
          const eventosPorData = this.processarDadosParaCalendario(dadosNormalizados);
          this.calendarOptions.events = eventosPorData;
          console.log('✅ Eventos normalizados carregados:', eventosPorData);
        } else {
          console.warn('⚠️ API retornou vazio, usando dados mockados');
          this.carregarEventosMockados();
        }
      },
      error: (err) => {
        console.error('❌ Erro ao carregar eventos:', err);
        this.carregarEventosMockados();
      }
    });
  }

  processarDadosParaCalendario(dados: any[]): EventoCalendario[] {
    const dadosPorData: { [key: string]: number } = {};
    
    dados.forEach(item => {
      const timestamp = item.timestamp || item.data;
      if (timestamp) {
        const data = new Date(timestamp).toISOString().split('T')[0];
        dadosPorData[data] = (dadosPorData[data] || 0) + 1;
      }
    });

    const eventos: EventoCalendario[] = Object.entries(dadosPorData).map(([data, quantidade]) => {
      let cor = '#10b981';
      if (quantidade > 10) cor = '#ef4444';
      else if (quantidade > 5) cor = '#fb923c';

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

  handleDateClick(arg: DateClickArg) {
    console.log('Data clicada:', arg.dateStr);
    this.dataSelecionada = arg.dateStr;
    this.carregarDadosDoDia(arg.dateStr);
  }

  handleEventClick(arg: EventClickArg) {
    const data = arg.event.startStr;
    const quantidade = arg.event.extendedProps['quantidade'];
    
    console.log('Evento clicado:', data, 'Quantidade:', quantidade);
    this.dataSelecionada = data;
    this.carregarDadosDoDia(data);
  }

  carregarDadosDoDia(data: string) {
    this.carregando = true;
    this.mostrarDetalhes = false;

    this.apiService.getDadosPorData(data).subscribe({
      next: (dados: any) => {
        // ✅ NORMALIZAR OS DADOS DO DIA
        const dadosArray = Array.isArray(dados) ? dados : [];
        this.dadosDia = DataNormalizer.normalizarRegistros(dadosArray);
        
        this.carregando = false;
        
        setTimeout(() => {
          this.mostrarDetalhes = true;
        }, 100);
        
        console.log('✅ Dados do dia normalizados:', this.dadosDia);
      },
      error: (err: any) => {
        console.error('Erro ao carregar dados:', err);
        this.carregando = false;
        this.mostrarDetalhes = false;
        this.dadosDia = [];
      }
    });
  }

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