import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppAuthService } from '../app.auth/app.auth.service';
import { AppMainComponent } from '../app.main/app.main.component';

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html',
  styleUrls: ['./app.topbar.component.scss'],
  standalone: true
})
export class AppTopBarComponent {
  readonly nomeUsuario = 'Sérgio Márcio Pereira da Silva';
  readonly nomeUnidade = 'Secretaria de Gestão de Pessoas';
  readonly matricula = localStorage.getItem('matricula') || 'S043197';
  fotoUsuario = 'https://intranet.stj.jus.br/intranetstj/Servidor/bitmap.asp?mat=' + encodeURIComponent(this.matricula);
  constructor(public appMain: AppMainComponent, private auth: AppAuthService, private router: Router) {}
  onProfileBtnClick(): void {
    this.appMain.profileMenuClick = true;
    this.appMain.profileMenuOpen = !this.appMain.profileMenuOpen;
  }
  closeProfileMenu(): void { this.appMain.profileMenuOpen = false; }
  fotoIndisponivel(): void { this.fotoUsuario = 'assets/images/usuario-avatar.svg'; }
  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
