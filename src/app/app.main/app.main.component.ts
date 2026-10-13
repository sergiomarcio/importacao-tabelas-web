import { animate, state, style, transition, trigger } from '@angular/animations';

import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';
import { AppComponent } from '../app.component';
import { AppMenuComponent } from '../app.menu/app.menu.component';
import { AppMenuService } from '../app.menu/app.menu.service';
import { AppTopBarComponent } from '../app.topbar/app.topbar.component';

@Component({
  selector: 'app-main',
  templateUrl: './app.main.component.html',
  animations: [
    trigger('mask-anim', [
      state('void', style({
        opacity: 0
      })),
      state('visible', style({
        opacity: 0.8
      })),
      transition('* => *', animate('250ms cubic-bezier(0, 0, 0.2, 1)'))
    ])
  ],
  standalone: true,
  imports: [
    AppMenuComponent,
    AppTopBarComponent,
    FormsModule,
    RouterModule
]
})
export class AppMainComponent implements OnInit {

  rightPanelClick: boolean;
  rightPanelActive: boolean;
  menuClick: boolean;
  staticMenuActive: boolean;
  menuMobileActive: boolean;
  megaMenuClick: boolean;
  megaMenuActive: boolean;
  megaMenuMobileClick: boolean;
  megaMenuMobileActive: boolean;
  topbarItemClick: boolean;
  topbarMobileMenuClick: boolean;
  topbarMobileMenuActive: boolean;
  sidebarActive: boolean;
  activeTopbarItem: any;
  topbarMenuActive: boolean;
  menuHoverActive: boolean;
  configActive: boolean;
  profileMenuClick: boolean;
  profileMenuOpen = false;

  tituloPagina = '';
  tipoMenuClicado = 1;

  mostraMenu = true;
  menuCollapsed = false;

  toggleMenuCollapsed(): void {
    this.menuCollapsed = !this.menuCollapsed;
  }

  constructor(
    private menuService: AppMenuService,
    private primengConfig: PrimeNGConfig,
    public app: AppComponent,
  ) { }

  ngOnInit() {
    let permissaoUsuario = localStorage.getItem('permissaoUsuario');
    if (permissaoUsuario == '2') { this.mostraMenu = false; }
    if (permissaoUsuario == '1') { this.mostraMenu = false; }
    if (permissaoUsuario == '0') { this.mostraMenu = true; }
  }

  itemMenuSelecionado(event): void {


  }

  onLayoutClick() {

    if (!this.topbarItemClick) {
      this.activeTopbarItem = null;
      this.topbarMenuActive = false;
    }

    if (!this.rightPanelClick) {
      this.rightPanelActive = false;
    }

    if (!this.megaMenuClick) {
      this.megaMenuActive = false;
    }

    if (!this.megaMenuMobileClick) {
      this.megaMenuMobileActive = false;
    }

    if (!this.menuClick) {
      if (this.isHorizontal() || this.menuCollapsed) {
        this.menuService.reset();
      }

      if (this.menuMobileActive) {
        this.menuMobileActive = false;
      }

      this.menuHoverActive = false;
    }

    if (!this.profileMenuClick) {
      this.profileMenuOpen = false;
    }

    this.menuClick = false;
    this.topbarItemClick = false;
    this.megaMenuClick = false;
    this.megaMenuMobileClick = false;
    this.rightPanelClick = false;
    this.profileMenuClick = false;
  }

  onMegaMenuButtonClick(event) {
    this.megaMenuClick = true;
    this.megaMenuActive = !this.megaMenuActive;
    event.preventDefault();
  }

  onMegaMenuClick(event) {
    this.megaMenuClick = true;
    event.preventDefault();
  }

  onTopbarItemClick(event, item) {
    this.topbarItemClick = true;

    if (this.activeTopbarItem == item) {
      this.activeTopbarItem = null;
    } else {
      this.activeTopbarItem = item;
    }

    event.preventDefault();
  }

  toggleProfileMenu(event: Event) {
    this.topbarItemClick = true;
    this.activeTopbarItem = this.activeTopbarItem === '__profile__' ? null : '__profile__';
    event.preventDefault();
  }

  onRightPanelButtonClick(event) {
    this.rightPanelClick = true;
    this.rightPanelActive = !this.rightPanelActive;

    event.preventDefault();
  }

  onRightPanelClose(event) {
    this.rightPanelActive = false;
    this.rightPanelClick = false;

    event.preventDefault();
  }

  onRightPanelClick(event) {
    this.rightPanelClick = true;

    event.preventDefault();
  }

  onTopbarMobileMenuButtonClick(event) {
    this.topbarMobileMenuClick = true;
    this.topbarMobileMenuActive = !this.topbarMobileMenuActive;

    event.preventDefault();
  }

  onMegaMenuMobileButtonClick(event) {
    this.megaMenuMobileClick = true;
    this.megaMenuMobileActive = !this.megaMenuMobileActive;

    event.preventDefault();
  }

  onMenuButtonClick(event) {
    this.menuClick = true;
    this.topbarMenuActive = false;

    if (this.isMobile()) {
      this.menuMobileActive = !this.menuMobileActive;
    }

    event.preventDefault();
  }

  onSidebarClick(event: Event) {
    this.menuClick = true;
  }

  onToggleMenuClick(event: Event) {
    this.staticMenuActive = !this.staticMenuActive;
    event.preventDefault();
  }

  onRippleChange(event) {
    this.app.ripple = event.checked;
    this.primengConfig = event.checked;
  }

  isDesktop() {
    return window.innerWidth > 991;
  }

  isMobile() {
    return window.innerWidth <= 991;
  }

  isHorizontal() {
    return this.app.horizontalMenu == true;
  }
}
