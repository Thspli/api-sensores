import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CalendarioPageRoutingModule } from './calendario-routing.module';
import { CalendarioPage } from './calendario.page';

// FullCalendar - ADICIONAR ESTAS LINHAS
import { FullCalendarModule } from '@fullcalendar/angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CalendarioPageRoutingModule,
    FullCalendarModule // ← ADICIONAR AQUI
  ],
  declarations: [CalendarioPage]
})
export class CalendarioPageModule {}