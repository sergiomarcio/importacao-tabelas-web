import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, finalize, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';
import { AppAuthService } from '../app.auth/app.auth.service';

@Component({
  selector: 'importacao-tabelas-login',
  templateUrl: './app.login.component.html',
  styleUrls: ['./app.login.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule]
})
export class ImportacaoTabelasLoginComponent implements OnDestroy {
  private unsubscribe = new Subject<void>();
  loginFormGroup: FormGroup;
  spinnerVisivel = false;
  mostrarSenha = false;
  readonly isLocalhost = this.appAuthService.desenvolvimentoLocal;
  constructor(formBuilder: FormBuilder, private appAuthService: AppAuthService, private router: Router) {
    this.loginFormGroup = formBuilder.group({
      usuario: ['', [Validators.required, Validators.pattern(/\S/)]],
      password: ['', Validators.required]
    });
  }
  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
  fazerLogin(): void {
    if (this.spinnerVisivel) { return; }
    this.loginFormGroup.markAllAsTouched();
    if (this.loginFormGroup.invalid) { return; }
    this.spinnerVisivel = true;
    const { usuario, password } = this.loginFormGroup.value;
    this.appAuthService.login(usuario.trim(), password).pipe(
      takeUntil(this.unsubscribe), finalize(() => this.spinnerVisivel = false)
    ).subscribe({
      next: () => this.router.navigate(['/']),
      error: error => Swal.fire({
        icon: 'error', title: 'Não foi possível entrar',
        text: error.status === 0 ? 'Não foi possível conectar ao serviço de autenticação. Verifique a rede ou VPN.' :
          error.status === 400 || error.status === 401 ? 'Usuário ou senha inválidos.' :
          'O serviço de autenticação está indisponível. Tente novamente.'
      })
    });
  }
  entrarDesenvolvimento(): void {
    this.appAuthService.loginDesenvolvimento();
    this.router.navigate(['/']);
  }
}
