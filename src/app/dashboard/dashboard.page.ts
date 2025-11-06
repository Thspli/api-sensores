import { Component, OnInit } from '@angular/core';
import { Api } from '../api';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {

  public datetime!: string;

  constructor(private apiService:Api) { }

  ngOnInit() {
    this.carregarDados();
  }

  carregarDados(): any {
    this.apiService.getSensores().subscribe({
      next: (data) => {
        console.log(data);
        console.log("ola mundo")
      }, error: (err) => {
        console.error('Erro ao carregar dados dos sensores', err)
      }
    })
  }

  carregarDadosPorData(dataSelecionada:string): any {
    this.apiService.getDadosPorData(dataSelecionada).subscribe({
      next: (data) => {
        console.log(data);
      }, error: (err) => {
        console.error('Erro ao carregar dados dos sensores', err)
      }
    })
  }


  mostrarData(): void {
    console.log(this.datetime);
  }
}
