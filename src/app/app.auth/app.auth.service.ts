import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { CustomHttpParameterCodec } from '../utilities/custom-http-parameter-codec';

@Injectable({ providedIn: 'root' })
export class AppAuthService {
  private jwt = new JwtHelperService();
  readonly desenvolvimentoLocal = !environment.production && ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
  private readonly sessionKeys = ['token', 'loginUsuario', 'matricula', 'nomeUsuario', 'nomeUnidade', 'siglaUnidade', 'permissaoUsuario'];
  constructor(private http: HttpClient) {}
  login(username: string, password: string) {
    const body = new HttpParams({ encoder: new CustomHttpParameterCodec() })
      .set('username', username).set('password', password).set('grant_type', 'password');
    return this.http.post<{ access_token: string }>(environment.integraAuth, body.toString(), {
      headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json', Authorization: 'Basic ' + btoa('client-password:secret') })
    }).pipe(tap(response => {
      if (!response.access_token || this.jwt.isTokenExpired(response.access_token)) {
        throw new Error('O servidor não retornou um token válido.');
      }
      const claims = this.jwt.decodeToken(response.access_token);
      this.logout();
      localStorage.setItem('token', response.access_token);
      this.salvarPerfil(claims.login || username, claims.matricula_servidor || 'S043197');
    }));
  }
  loginDesenvolvimento(): void {
    if (!this.desenvolvimentoLocal) { return; }
    this.logout();
    sessionStorage.setItem('importacaoTabelasDesenvolvimento', '1');
    this.salvarPerfil('smarcio', 'S043197');
  }
  private salvarPerfil(login: string, matricula: string): void {
    localStorage.setItem('loginUsuario', login);
    localStorage.setItem('matricula', matricula);
    localStorage.setItem('nomeUsuario', 'Sérgio Márcio Pereira da Silva');
    localStorage.setItem('nomeUnidade', 'Secretaria de Gestão de Pessoas');
    localStorage.setItem('siglaUnidade', 'SGP');
  }
  logout(): void {
    this.sessionKeys.forEach(key => localStorage.removeItem(key));
    sessionStorage.removeItem('importacaoTabelasDesenvolvimento');
  }
  isAutenticated(): boolean {
    return (this.desenvolvimentoLocal && sessionStorage.getItem('importacaoTabelasDesenvolvimento') === '1') || !this.isTokenExpired();
  }
  isTokenExpired(): boolean {
    const token = localStorage.getItem('token');
    try { return !token || this.jwt.isTokenExpired(token); } catch { return true; }
  }
}
