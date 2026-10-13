import { Component } from '@angular/core';
import { ListaTabelasComponent } from '../lista-tabelas/lista-tabelas.component';

@Component({
  selector: 'app-exportacao-tabelas',
  standalone: true,
  imports: [ListaTabelasComponent],
  template: '<app-lista-tabelas operacao="exportacao"></app-lista-tabelas>'
})
export class ExportacaoTabelasComponent {}
