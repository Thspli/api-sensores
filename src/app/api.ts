// src/app/api.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Api {
  private apiUrl: string = 'https://esp32-mongodb-idev3.onrender.com';
  private collection: string = 'thalisson';

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