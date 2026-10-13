import { CadastroTabelasComponent } from './pages/importacao-tabelas/cadastro-tabelas/cadastro-tabelas.component';
import { ExportacaoTabelasComponent } from './pages/importacao-tabelas/exportacao-tabelas/exportacao-tabelas.component';
import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { AppAuthService } from './app.auth/app.auth.service';
import { ImportacaoTabelasLoginComponent } from './app.login/app.login.component';
import { AppMainComponent } from './app.main/app.main.component';
import { ImportacaoTabelasLandpageComponent } from './pages/importacao-tabelas/landpage/landpage.component';

const authenticated: CanActivateFn = () => inject(AppAuthService).isAutenticated() || inject(Router).createUrlTree(['/login']);
export const routes: Routes = [
  { path: 'login', component: ImportacaoTabelasLoginComponent },
  { path: '', component: AppMainComponent, canActivate: [authenticated], canActivateChild: [authenticated], children: [
    { path: '', component: ImportacaoTabelasLandpageComponent },
    { path: 'importacao-tabelas', component: ImportacaoTabelasLandpageComponent },
    { path: 'exportacao-tabelas', component: ExportacaoTabelasComponent },
    { path: 'cadastro-tabelas', component: CadastroTabelasComponent },
    { path: 'dashboard', redirectTo: '', pathMatch: 'full' }
  ] },
  { path: '**', redirectTo: '' }
];


