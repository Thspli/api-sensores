import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'registros',
        loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardPageModule)
      },
      {
        path: 'calendario',
        loadChildren: () => import('../calendario/calendario.module').then(m => m.CalendarioPageModule)
      },
      {
        path: 'graficos',
        loadChildren: () => import('../graficos/graficos.module').then(m => m.GraficosPageModule)
      },
      {
        path: '',
        redirectTo: 'registros',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}