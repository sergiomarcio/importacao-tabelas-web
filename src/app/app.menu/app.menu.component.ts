import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { Subject } from 'rxjs';
import { AppMainComponent } from '../app.main/app.main.component';
import { AppMenuitemComponent } from '../app.menuitem/app.menuitem.component';

@Component({
  selector: 'app-menu',
  templateUrl: './app.menu.component.html',
  styleUrls: ['./app.menu.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    AppMenuitemComponent,

    CommonModule,
    FormsModule,
    TooltipModule,
  ]
})
export class AppMenuComponent implements OnInit, OnDestroy {

  unsubscribe = new Subject();
  model: any[];

  permissaoUsuario = '';
  matricula = '';
  collapsed = false;

  constructor(
    public appMain: AppMainComponent,
    private router: Router,
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe.next(null);
    this.unsubscribe.complete();
  }

  ngOnInit() { this.montaMenu(); }

  montaMenu(): void {

    this.model = [
      { label: 'Importar tabelas', icon: 'pi pi-fw pi-table', routerLink: ['/importacao-tabelas'] },
      { label: 'Exportar para Excel', icon: 'pi pi-fw pi-file-excel', routerLink: ['/exportacao-tabelas'] },
      { label: 'Cadastro de tabelas', icon: 'pi pi-fw pi-list', routerLink: ['/cadastro-tabelas'] }
    ];
  }
  onMenuClick() {
    this.appMain.menuClick = true;
  }

  gotoLandpage(): void {
    this.router.navigate(['']);
  }
}



