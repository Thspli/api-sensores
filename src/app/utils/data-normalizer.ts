// src/app/utils/data-normalizer.ts

export class DataNormalizer {
  
    /**
     * Normaliza um registro completo da API
     */
    static normalizarRegistro(registro: any): any {
      if (!registro) return registro;
  
      return {
        ...registro,
        turbidez: this.normalizarTurbidez(registro.turbidez),
        ph: this.normalizarPH(registro.ph),
        cloro: this.normalizarCloro(registro.cloro),
        nivel_agua: this.normalizarNivelAgua(registro.nivel_agua)
      };
    }
  
    /**
     * Normaliza array de registros
     */
    static normalizarRegistros(registros: any[]): any[] {
      if (!Array.isArray(registros)) return [];
      return registros.map(registro => this.normalizarRegistro(registro));
    }
  
    /**
     * Normaliza pH (escala esperada: 0-14)
     * Exemplos:
     * - 2632 → 2.632 (divide por 1000)
     * - 750 → 7.50 (divide por 100)
     * - 7.5 → 7.5 (já está correto)
     */
    static normalizarPH(valor: any): number | null {
      if (valor === null || valor === undefined || valor === '') return null;
      
      let ph = Number(valor);
      
      // Se não é um número válido
      if (isNaN(ph)) return null;
      
      // Se já está na escala correta (0-14)
      if (ph >= 0 && ph <= 14) {
        return this.arredondar(ph, 2);
      }
      
      // Se está entre 100-1400 (provavelmente multiplicado por 100)
      if (ph >= 100 && ph <= 1400) {
        ph = ph / 100;
        return this.arredondar(ph, 2);
      }
      
      // Se está entre 1000-14000 (provavelmente multiplicado por 1000)
      if (ph >= 1000 && ph <= 14000) {
        ph = ph / 1000;
        return this.arredondar(ph, 2);
      }
      
      // Se está entre 15-140 (provavelmente multiplicado por 10)
      if (ph >= 15 && ph <= 140) {
        ph = ph / 10;
        return this.arredondar(ph, 2);
      }
      
      // Valor inválido
      console.warn(`⚠️ Valor de pH inválido: ${valor}`);
      return null;
    }
  
    /**
     * Normaliza Turbidez (escala esperada: 0-100 NTU para água tratada)
     * Exemplos:
     * - 1550 → 15.50 (divide por 100)
     * - 523 → 5.23 (divide por 100)
     * - 8.5 → 8.5 (já está correto)
     */
    static normalizarTurbidez(valor: any): number | null {
      if (valor === null || valor === undefined || valor === '') return null;
      
      let turbidez = Number(valor);
      
      if (isNaN(turbidez)) return null;
      
      // Se já está na escala razoável (0-100)
      if (turbidez >= 0 && turbidez <= 100) {
        return this.arredondar(turbidez, 2);
      }
      
      // Se está entre 100-10000 (provavelmente multiplicado por 100)
      if (turbidez >= 100 && turbidez <= 10000) {
        turbidez = turbidez / 100;
        return this.arredondar(turbidez, 2);
      }
      
      // Se está acima de 10000 (provavelmente multiplicado por 1000)
      if (turbidez >= 10000) {
        turbidez = turbidez / 1000;
        return this.arredondar(turbidez, 2);
      }
      
      console.warn(`⚠️ Valor de turbidez inválido: ${valor}`);
      return null;
    }
  
    /**
     * Normaliza Cloro (escala esperada: 0-5 mg/L)
     * Exemplos:
     * - 2500 → 2.50 (divide por 1000)
     * - 180 → 1.80 (divide por 100)
     * - 2.5 → 2.5 (já está correto)
     */
    static normalizarCloro(valor: any): number | null {
      if (valor === null || valor === undefined || valor === '') return null;
      
      let cloro = Number(valor);
      
      if (isNaN(cloro)) return null;
      
      // Se já está na escala razoável (0-5)
      if (cloro >= 0 && cloro <= 5) {
        return this.arredondar(cloro, 2);
      }
      
      // Se está entre 5-500 (provavelmente multiplicado por 100)
      if (cloro > 5 && cloro <= 500) {
        cloro = cloro / 100;
        return this.arredondar(cloro, 2);
      }
      
      // Se está acima de 500 (provavelmente multiplicado por 1000)
      if (cloro > 500) {
        cloro = cloro / 1000;
        return this.arredondar(cloro, 2);
      }
      
      console.warn(`⚠️ Valor de cloro inválido: ${valor}`);
      return null;
    }
  
    /**
     * Normaliza Nível de Água (escala esperada: 0-200 cm)
     * Exemplos:
     * - 8550 → 85.50 (divide por 100)
     * - 12000 → 120.00 (divide por 100)
     * - 75.5 → 75.5 (já está correto)
     */
    static normalizarNivelAgua(valor: any): number | null {
      if (valor === null || valor === undefined || valor === '') return null;
      
      let nivel = Number(valor);
      
      if (isNaN(nivel)) return null;
      
      // Se já está na escala razoável (0-200)
      if (nivel >= 0 && nivel <= 200) {
        return this.arredondar(nivel, 2);
      }
      
      // Se está entre 200-20000 (provavelmente multiplicado por 100)
      if (nivel > 200 && nivel <= 20000) {
        nivel = nivel / 100;
        return this.arredondar(nivel, 2);
      }
      
      // Se está acima de 20000 (provavelmente multiplicado por 1000)
      if (nivel > 20000) {
        nivel = nivel / 1000;
        return this.arredondar(nivel, 2);
      }
      
      console.warn(`⚠️ Valor de nível de água inválido: ${valor}`);
      return null;
    }
  
    /**
     * Arredonda número para N casas decimais
     */
    private static arredondar(valor: number, casasDecimais: number): number {
      const multiplicador = Math.pow(10, casasDecimais);
      return Math.round(valor * multiplicador) / multiplicador;
    }
  
    /**
     * Valida se um valor está dentro de uma faixa esperada
     */
    static validarFaixa(valor: number | null, min: number, max: number): boolean {
      if (valor === null) return false;
      return valor >= min && valor <= max;
    }
  
    /**
     * Retorna estatísticas de normalização para debug
     */
    static diagnosticarDados(registros: any[]): any {
      const stats = {
        total: registros.length,
        phForaEscala: 0,
        turbidezForaEscala: 0,
        cloroForaEscala: 0,
        nivelForaEscala: 0,
        exemplos: [] as any[]
      };
  
      registros.forEach((registro, index) => {
        const phOriginal = Number(registro.ph);
        const turbidezOriginal = Number(registro.turbidez);
        const cloroOriginal = Number(registro.cloro);
        const nivelOriginal = Number(registro.nivel_agua);
  
        // Detectar valores fora de escala
        if (!isNaN(phOriginal) && (phOriginal < 0 || phOriginal > 14)) {
          stats.phForaEscala++;
          if (stats.exemplos.length < 5) {
            stats.exemplos.push({
              campo: 'pH',
              original: phOriginal,
              normalizado: this.normalizarPH(phOriginal)
            });
          }
        }
  
        if (!isNaN(turbidezOriginal) && turbidezOriginal > 100) {
          stats.turbidezForaEscala++;
          if (stats.exemplos.length < 5) {
            stats.exemplos.push({
              campo: 'Turbidez',
              original: turbidezOriginal,
              normalizado: this.normalizarTurbidez(turbidezOriginal)
            });
          }
        }
  
        if (!isNaN(cloroOriginal) && cloroOriginal > 5) {
          stats.cloroForaEscala++;
          if (stats.exemplos.length < 5) {
            stats.exemplos.push({
              campo: 'Cloro',
              original: cloroOriginal,
              normalizado: this.normalizarCloro(cloroOriginal)
            });
          }
        }
  
        if (!isNaN(nivelOriginal) && nivelOriginal > 200) {
          stats.nivelForaEscala++;
          if (stats.exemplos.length < 5) {
            stats.exemplos.push({
              campo: 'Nível',
              original: nivelOriginal,
              normalizado: this.normalizarNivelAgua(nivelOriginal)
            });
          }
        }
      });
  
      return stats;
    }
  }
  
 