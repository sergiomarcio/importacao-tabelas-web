
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PrimeNGConfig } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Subject } from 'rxjs';
import { ImportacaoTabelasService } from '../../../services/importacao-tabelas.service';

@Component({
  selector: 'importacao-tabelas-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
  ]
})
export class ImportacaoTabelasDashBoardComponent implements OnInit, OnDestroy {

  unsubscribe = new Subject();

  constructor(
    private primeNgConfig: PrimeNGConfig,
    private importacaoTabelasService: ImportacaoTabelasService,
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe.next(null);
    this.unsubscribe.complete();
  }

  ngOnInit(): void {

  }
}
