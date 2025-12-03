import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-graficos',
  templateUrl: './graficos.page.html',
  styleUrls: ['./graficos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class GraficosPage implements OnInit, AfterViewInit {
  @ViewChild('turbidezChart') turbidezChartRef!: ElementRef;
  @ViewChild('phChart') phChartRef!: ElementRef;
  @ViewChild('comparacaoChart') comparacaoChartRef!: ElementRef;
  @ViewChild('cloroChart') cloroChartRef!: ElementRef;

  // Charts
  turbidezChart: any;
  phChart: any;
  comparacaoChart: any;
  cloroChart: any;

  periodoSelecionado: string = '24h';

  // Estatísticas
  estatisticas = {
    turbidezMedia: 0,
    turbidezTendencia: 0,
    phMedio: 0,
    phTendencia: 0,
    cloroMedio: 0,
    cloroTendencia: 0,
    nivelMedio: 0,
    nivelTendencia: 0
  };

  constructor() {}

  ngOnInit() {
    this.calcularEstatisticas();
  }

  ngAfterViewInit() {
    // Pequeno delay para garantir que os canvas estejam renderizados
    setTimeout(() => {
      this.criarGraficos();
    }, 100);
  }

  // ========================================
  // CRIAR GRÁFICOS
  // ========================================

  criarGraficos() {
    this.criarGraficoTurbidez();
    this.criarGraficoPh();
    this.criarGraficoComparacao();
    this.criarGraficoCloro();
  }

  // Gráfico de Linha - Turbidez
  criarGraficoTurbidez() {
    const ctx = this.turbidezChartRef.nativeElement.getContext('2d');
    const dados = this.gerarDadosMockados('turbidez');

    this.turbidezChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dados.labels,
        datasets: [{
          label: 'Turbidez (NTU)',
          data: dados.valores,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { size: 12, weight: 'bold' },
              padding: 15
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            cornerRadius: 8
          }
        },
        scales: {
          y: {
            beginAtZero: true,
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
      }
    });
  }

  // Gráfico de Linha - pH
  criarGraficoPh() {
    const ctx = this.phChartRef.nativeElement.getContext('2d');
    const dados = this.gerarDadosMockados('ph');

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
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { size: 12, weight: 'bold' },
              padding: 15
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            cornerRadius: 8
          }
        },
        scales: {
          y: {
            min: 0,
            max: 14,
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
      }
    });
  }

  // Gráfico de Barras - Comparação
  criarGraficoComparacao() {
    const ctx = this.comparacaoChartRef.nativeElement.getContext('2d');

    this.comparacaoChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Turbidez', 'pH', 'Cloro', 'Nível Água'],
        datasets: [{
          label: 'Média Atual',
          data: [15.5, 7.2, 2.8, 45.3], // Valores mockados
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(139, 92, 246, 0.8)'
          ],
          borderColor: [
            '#3b82f6',
            '#10b981',
            '#fb923c',
            '#8b5cf6'
          ],
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { size: 12, weight: 'bold' },
              padding: 15
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            cornerRadius: 8
          }
        },
        scales: {
          y: {
            beginAtZero: true,
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
              font: { size: 11 }
            }
          }
        }
      }
    });
  }

  // Gráfico de Rosca - Cloro
  criarGraficoCloro() {
    const ctx = this.cloroChartRef.nativeElement.getContext('2d');

    this.cloroChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Ideal', 'Aceitável', 'Baixo', 'Alto'],
        datasets: [{
          data: [45, 30, 15, 10], // Percentuais mockados
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderColor: '#fff',
          borderWidth: 3,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              font: { size: 12, weight: 'bold' },
              padding: 15,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            cornerRadius: 8,
            callbacks: {
              label: (context: any) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                return `${label}: ${value}%`;
              }
            }
          }
        }
      }
    });
  }

  // ========================================
  // GERAR DADOS MOCKADOS
  // ========================================

  gerarDadosMockados(tipo: string) {
    let labels: string[] = [];
    let valores: number[] = [];

    if (this.periodoSelecionado === '24h') {
      // Últimas 24 horas (de hora em hora)
      for (let i = 23; i >= 0; i--) {
        const hora = new Date();
        hora.setHours(hora.getHours() - i);
        labels.push(hora.getHours() + ':00');
      }
    } else if (this.periodoSelecionado === '7d') {
      // Últimos 7 dias
      for (let i = 6; i >= 0; i--) {
        const dia = new Date();
        dia.setDate(dia.getDate() - i);
        labels.push(dia.getDate() + '/' + (dia.getMonth() + 1));
      }
    } else if (this.periodoSelecionado === '30d') {
      // Últimos 30 dias
      for (let i = 29; i >= 0; i--) {
        const dia = new Date();
        dia.setDate(dia.getDate() - i);
        labels.push(dia.getDate() + '/' + (dia.getMonth() + 1));
      }
    }

    // Gerar valores aleatórios baseados no tipo
    valores = labels.map(() => {
      switch (tipo) {
        case 'turbidez':
          return Math.random() * 20 + 5; // Entre 5 e 25 NTU
        case 'ph':
          return Math.random() * 2 + 6.5; // Entre 6.5 e 8.5
        case 'cloro':
          return Math.random() * 3 + 1; // Entre 1 e 4 mg/L
        case 'nivel':
          return Math.random() * 40 + 30; // Entre 30 e 70 cm
        default:
          return 0;
      }
    });

    return { labels, valores };
  }

  // ========================================
  // CALCULAR ESTATÍSTICAS
  // ========================================

  calcularEstatisticas() {
    // Valores mockados - substituir pela API quando disponível
    this.estatisticas = {
      turbidezMedia: 15.5,
      turbidezTendencia: -2.3,
      phMedio: 7.2,
      phTendencia: 1.5,
      cloroMedio: 2.8,
      cloroTendencia: 0.8,
      nivelMedio: 45.3,
      nivelTendencia: -1.2
    };
  }

  // ========================================
  // ATUALIZAR GRÁFICOS
  // ========================================

  atualizarGraficos() {
    // Destruir gráficos existentes
    if (this.turbidezChart) this.turbidezChart.destroy();
    if (this.phChart) this.phChart.destroy();
    if (this.comparacaoChart) this.comparacaoChart.destroy();
    if (this.cloroChart) this.cloroChart.destroy();

    // Recriar com novos dados
    setTimeout(() => {
      this.criarGraficos();
      this.calcularEstatisticas();
    }, 100);
  }

  // ========================================
  // INTEGRAÇÃO COM API (PREPARADO PARA O FUTURO)
  // ========================================

  /*
  async carregarDadosDaAPI() {
    try {
      const response = await fetch('SUA_API_URL/sensores');
      const dados = await response.json();
      
      // Processar dados da API
      this.processarDadosAPI(dados);
      
      // Atualizar gráficos com dados reais
      this.atualizarGraficos();
    } catch (error) {
      console.error('Erro ao carregar dados da API:', error);
      // Usar dados mockados em caso de erro
    }
  }

  processarDadosAPI(dados: any) {
    // Transformar dados da API no formato necessário para os gráficos
    // Implementar quando a API estiver pronta
  }
  */
}