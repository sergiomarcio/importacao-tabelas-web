import { Component } from '@angular/core';
import { ListaTabelasComponent } from '../lista-tabelas/lista-tabelas.component';
@Component({
  selector: 'importacao-tabelas-landpage',
  templateUrl: './landpage.component.html',
  styleUrls: ['./landpage.component.scss'],
  standalone: true,
  imports: [ListaTabelasComponent]
})
export class ImportacaoTabelasLandpageComponent {}
