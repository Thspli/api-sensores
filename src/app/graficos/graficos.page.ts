import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Api } from '../api';
import { DataNormalizer } from '../utils/data-normalizer';

Chart.register(...registerables);

@Component({
  selector: 'app-graficos',
  templateUrl: './graficos.page.html',
  styleUrls: ['./graficos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class GraficosPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('turbidezChart') turbidezChartRef!: ElementRef;
  @ViewChild('phChart') phChartRef!: ElementRef;
  @ViewChild('nivelChart') nivelChartRef!: ElementRef;

  // Charts - APENAS 3
  turbidezChart: any;
  phChart: any;
  nivelChart: any;

  periodoSelecionado: string = '24h';

  // Dados da API
  dadosAPI: any[] = [];
  historicoCompleto: any[] = [];
  
  // Subscription para atualização automática
  private atualizacaoSubscription?: Subscription;

  // Estatísticas - APENAS 3
  estatisticas = {
    turbidezMedia: 0,
    turbidezTendencia: 0,
    phMedio: 0,
    phTendencia: 0,
    nivelMedio: 0,
    nivelTendencia: 0
  };

  constructor(private apiService: Api) {}

  ngOnInit() {
    this.carregarDadosDaAPI();
    this.iniciarAtualizacaoAutomatica();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.criarGraficos();
    }, 100);
  }

  ngOnDestroy() {
    if (this.atualizacaoSubscription) {
      this.atualizacaoSubscription.unsubscribe();
    }
    this.destruirGraficos();
  }

  // ========================================
  // CARREGAR DADOS DA API
  // ========================================

  carregarDadosDaAPI() {
    console.log('🔍 Buscando dados da API...');
    
    this.apiService.getSensores().subscribe({
      next: (dados: any) => {
        console.log('📥 Dados recebidos (ANTES da normalização):', dados);
        
        if (dados && dados.length > 0) {
          this.dadosAPI = DataNormalizer.normalizarRegistros(dados);
          
          const diagnostico = DataNormalizer.diagnosticarDados(dados);
          console.log('📊 Diagnóstico de normalização:', {
            total: diagnostico.total,
            phForaEscala: diagnostico.phForaEscala,
            turbidezForaEscala: diagnostico.turbidezForaEscala,
            nivelForaEscala: diagnostico.nivelForaEscala,
            exemplos: diagnostico.exemplos
          });
          
          console.log('✅ Dados normalizados (DEPOIS):', this.dadosAPI);
          
          this.processarDados();
          this.calcularEstatisticas();
          
          if (this.turbidezChart) {
            this.atualizarGraficos();
          }
        } else {
          console.warn('⚠️ API retornou vazio, usando dados mockados');
          this.gerarDadosMockados();
          this.processarDados();
          this.calcularEstatisticas();
        }
      },
      error: (error) => {
        console.error('❌ Erro ao carregar dados da API:', error);
        this.gerarDadosMockados();
        this.processarDados();
        this.calcularEstatisticas();
      }
    });
  }

  // ========================================
  // PROCESSAR DADOS DA API
  // ========================================

  processarDados() {
    if (this.dadosAPI.length === 0) {
      console.warn('⚠️ Nenhum dado da API, usando mockados');
      this.gerarDadosMockados();
      return;
    }

    this.dadosAPI.sort((a, b) => {
      const dateA = new Date(a.timestamp || a.data).getTime();
      const dateB = new Date(b.timestamp || b.data).getTime();
      return dateA - dateB;
    });

    this.historicoCompleto = [...this.dadosAPI];

    console.log(`📊 Processados ${this.historicoCompleto.length} registros da API`);
  }

  // ========================================
  // CRIAR GRÁFICOS - APENAS 3
  // ========================================

  criarGraficos() {
    this.criarGraficoTurbidez();
    this.criarGraficoPh();
    this.criarGraficoNivel();
  }

  // Gráfico de Linha - Turbidez
  criarGraficoTurbidez() {
    const ctx = this.turbidezChartRef.nativeElement.getContext('2d');
    const dados = this.extrairDadosParaGrafico('turbidez');

    this.turbidezChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dados.labels,
        datasets: [{
          label: 'Turbidez (NTU)',
          data: dados.valores,
          borderColor: '#fb923c',
          backgroundColor: 'rgba(251, 146, 60, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#fb923c',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: this.getOpcoesGraficoLinha('Turbidez', 'NTU')
    });
  }

  // Gráfico de Linha - pH
  criarGraficoPh() {
    const ctx = this.phChartRef.nativeElement.getContext('2d');
    const dados = this.extrairDadosParaGrafico('ph');

    this.phChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dados.labels,
        datasets: [{
          label: 'pH',
          data: dados.valores,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: this.getOpcoesGraficoLinha('pH', 'pH', 0, 14)
    });
  }

  // Gráfico de Linha - Nível da Água
  criarGraficoNivel() {
    const ctx = this.nivelChartRef.nativeElement.getContext('2d');
    const dados = this.extrairDadosParaGrafico('nivel');

    this.nivelChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dados.labels,
        datasets: [{
          label: 'Nível da Água (cm)',
          data: dados.valores,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#8b5cf6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: this.getOpcoesGraficoLinha('Nível da Água', 'cm')
    });
  }

  // ========================================
  // EXTRAIR DADOS PARA GRÁFICOS
  // ========================================

  extrairDadosParaGrafico(tipo: string) {
    const labels: string[] = [];
    const valores: number[] = [];

    if (this.historicoCompleto.length === 0) {
      return this.gerarDadosMockadosParaTipo(tipo);
    }

    const dadosAgrupados = this.agruparDadosPorPeriodo();

    dadosAgrupados.forEach(item => {
      labels.push(item.label);
      
      let valor = 0;
      switch (tipo) {
        case 'turbidez':
          valor = item.turbidez || 0;
          break;
        case 'ph':
          valor = item.ph || 0;
          break;
        case 'nivel':
          valor = item.nivel_agua || 0;
          break;
      }
      valores.push(valor);
    });

    return { labels, valores };
  }

  agruparDadosPorPeriodo() {
    if (this.periodoSelecionado === '24h') {
      return this.agruparPorHora();
    } else if (this.periodoSelecionado === '7d') {
      return this.agruparPorDia();
    } else {
      return this.agruparPorDia();
    }
  }

  agruparPorHora() {
    const grupos: any = {};
    
    this.historicoCompleto.forEach(item => {
      const data = new Date(item.timestamp || item.data);
      const chave = `${data.getDate()}/${data.getMonth() + 1} ${data.getHours()}h`;
      
      if (!grupos[chave]) {
        grupos[chave] = {
          label: `${data.getHours()}h`,
          turbidez: [],
          ph: [],
          nivel_agua: []
        };
      }
      
      if (item.turbidez != null && item.turbidez > 0) grupos[chave].turbidez.push(item.turbidez);
      if (item.ph != null && item.ph > 0) grupos[chave].ph.push(item.ph);
      if (item.nivel_agua != null && item.nivel_agua > 0) grupos[chave].nivel_agua.push(item.nivel_agua);
    });
  
    return Object.values(grupos).map((grupo: any) => ({
      label: grupo.label,
      turbidez: this.calcularMedia(grupo.turbidez),
      ph: this.calcularMedia(grupo.ph),
      nivel_agua: this.calcularMedia(grupo.nivel_agua)
    }));
  }

  agruparPorDia() {
    const grupos: any = {};
    
    this.historicoCompleto.forEach(item => {
      const data = new Date(item.timestamp || item.data);
      const chave = `${data.getDate()}/${data.getMonth() + 1}`;
      
      if (!grupos[chave]) {
        grupos[chave] = {
          label: chave,
          turbidez: [],
          ph: [],
          nivel_agua: []
        };
      }
      
      if (item.turbidez != null && item.turbidez > 0) grupos[chave].turbidez.push(item.turbidez);
      if (item.ph != null && item.ph > 0) grupos[chave].ph.push(item.ph);
      if (item.nivel_agua != null && item.nivel_agua > 0) grupos[chave].nivel_agua.push(item.nivel_agua);
    });
  
    return Object.values(grupos).map((grupo: any) => ({
      label: grupo.label,
      turbidez: this.calcularMedia(grupo.turbidez),
      ph: this.calcularMedia(grupo.ph),
      nivel_agua: this.calcularMedia(grupo.nivel_agua)
    }));
  }

  calcularMedia(valores: number[]) {
    if (valores.length === 0) return 0;
    
    const valoresValidos = valores.filter(v => v != null && !isNaN(v) && v > 0);
    
    if (valoresValidos.length === 0) return 0;
    
    const soma = valoresValidos.reduce((acc, val) => acc + val, 0);
    const media = soma / valoresValidos.length;
    
    return Math.round(media * 100) / 100;
  }

  // ========================================
  // CALCULAR MÉDIAS E ESTATÍSTICAS
  // ========================================

  calcularMedias() {
    if (this.historicoCompleto.length === 0) {
      return { turbidez: 0, ph: 0, nivel: 0 };
    }
  
    const turbidez = this.historicoCompleto
      .map(d => d.turbidez)
      .filter(v => v != null && !isNaN(v) && v > 0);
    
    const ph = this.historicoCompleto
      .map(d => d.ph)
      .filter(v => v != null && !isNaN(v) && v > 0);
    
    const nivel = this.historicoCompleto
      .map(d => d.nivel_agua)
      .filter(v => v != null && !isNaN(v) && v > 0);
  
    return {
      turbidez: this.calcularMedia(turbidez),
      ph: this.calcularMedia(ph),
      nivel: this.calcularMedia(nivel)
    };
  }

  calcularEstatisticas() {
    const medias = this.calcularMedias();
    
    this.estatisticas = {
      turbidezMedia: medias.turbidez,
      turbidezTendencia: this.calcularTendencia('turbidez'),
      phMedio: medias.ph,
      phTendencia: this.calcularTendencia('ph'),
      nivelMedio: medias.nivel,
      nivelTendencia: this.calcularTendencia('nivel_agua')
    };
  }

  calcularTendencia(campo: string) {
    if (this.historicoCompleto.length < 2) return 0;

    const valores = this.historicoCompleto
      .map((d: any) => d[campo])
      .filter((v: any) => v != null && !isNaN(v) && v > 0);
    
    if (valores.length < 2) return 0;

    const metade = Math.floor(valores.length / 2);
    const primeiraMetade = valores.slice(0, metade);
    const segundaMetade = valores.slice(metade);

    const mediaPrimeira = this.calcularMedia(primeiraMetade);
    const mediaSegunda = this.calcularMedia(segundaMetade);

    if (mediaPrimeira === 0) return 0;

    const tendencia = ((mediaSegunda - mediaPrimeira) / mediaPrimeira) * 100;
    return Number(tendencia.toFixed(1));
  }

  // ========================================
  // ATUALIZAÇÃO AUTOMÁTICA
  // ========================================

  iniciarAtualizacaoAutomatica() {
    this.atualizacaoSubscription = interval(30000)
      .pipe(switchMap(() => this.apiService.getSensores()))
      .subscribe({
        next: (dados) => {
          console.log('♻️ Dados atualizados automaticamente');
          if (dados && dados.length > 0) {
            this.dadosAPI = DataNormalizer.normalizarRegistros(dados);
            this.processarDados();
            this.calcularEstatisticas();
            if (this.turbidezChart) {
              this.destruirGraficos();
              setTimeout(() => {
                this.criarGraficos();
              }, 100);
            }
          }
        },
        error: (err) => console.error('Erro na atualização automática:', err)
      });
  }

  // ========================================
  // ATUALIZAR GRÁFICOS
  // ========================================

  atualizarGraficos() {
    if (this.turbidezChart) {
      this.destruirGraficos();
      setTimeout(() => {
        this.criarGraficos();
      }, 100);
    }
  }

  destruirGraficos() {
    if (this.turbidezChart) this.turbidezChart.destroy();
    if (this.phChart) this.phChart.destroy();
    if (this.nivelChart) this.nivelChart.destroy();
  }

  // ========================================
  // OPÇÕES DOS GRÁFICOS
  // ========================================

  getOpcoesGraficoLinha(titulo: string, unidade: string, min?: number, max?: number) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top' as const,
          labels: {
            font: { size: 12, weight: 'bold' as const },
            padding: 15
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: { size: 14, weight: 'bold' as const },
          bodyFont: { size: 13 },
          cornerRadius: 8,
          callbacks: {
            label: (context: any) => `${context.dataset.label}: ${context.parsed.y.toFixed(2)} ${unidade}`
          }
        }
      },
      scales: {
        y: {
          min: min,
          max: max,
          beginAtZero: min === undefined,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            font: { size: 11 }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: { size: 10 },
            maxRotation: 45,
            minRotation: 45
          }
        }
      }
    };
  }

  // ========================================
  // DADOS MOCKADOS (FALLBACK)
  // ========================================

  gerarDadosMockados() {
    const agora = new Date();
    this.historicoCompleto = [];

    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(agora);
      timestamp.setHours(agora.getHours() - i);

      this.historicoCompleto.push({
        timestamp: timestamp.toISOString(),
        turbidez: Math.random() * 15 + 5,
        ph: Math.random() * 1.5 + 6.5,
        nivel_agua: Math.random() * 30 + 40
      });
    }
  }

  gerarDadosMockadosParaTipo(tipo: string) {
    const labels: string[] = [];
    const valores: number[] = [];

    for (let i = 23; i >= 0; i--) {
      const hora = new Date();
      hora.setHours(hora.getHours() - i);
      labels.push(hora.getHours() + ':00');

      switch (tipo) {
        case 'turbidez':
          valores.push(Math.random() * 15 + 5);
          break;
        case 'ph':
          valores.push(Math.random() * 1.5 + 6.5);
          break;
        case 'nivel':
          valores.push(Math.random() * 30 + 40);
          break;
      }
    }

    return { labels, valores };
  }
}