// src/app/api.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Api {
  private apiUrl: string = 'https://esp32-mongodb-idev3.onrender.com';
  private collection: string = 'gasparzinho';

  constructor(private http: HttpClient) {}

  public getSensores(): Observable<any> {
    return this.http.get<any[]>(this.apiUrl + '/api/leituras/' + this.collection);
  }

  public getDadosPorData(data: string): Observable<any> {
    return this.http.get<any[]>(
      this.apiUrl + '/api/historico-dia/' + this.collection + `?data=${data}`
    );
  }

  // Método adicional para buscar eventos de um mês específico (se sua API suportar)
  public getEventosPorMes(mes: string): Observable<any> {
    return this.http.get<any[]>(
      this.apiUrl + '/api/eventos-mes/' + this.collection + `?mes=${mes}`
    );
  }
}

// Interface recomendada para tipagem (opcional)
export interface SensorData {
  _id?: string;
  nome?: string;
  tipo?: string;
  localizacao?: string;
  timestamp?: string;
  data?: string;
  status?: string;
  turbidez?: number;
  ph?: number;
  cloro?: number;
  nivel_agua?: number;
  umidade_terra?: number; // NOVO CAMPO
}