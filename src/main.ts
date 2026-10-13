import { CurrencyPipe, DatePipe, LocationStrategy, PathLocationStrategy, registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import localePtBr from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { AppAuthInterceptor } from './app/app.auth/app.auth.interceptor';
import { AppComponent } from './app/app.component';
import { AppMenuService } from './app/app.menu/app.menu.service';
import { routes } from './app/app.routes';
import { ImportacaoTabelasService } from './app/services/importacao-tabelas.service';
registerLocaleData(localePtBr);

bootstrapApplication(AppComponent, {
  providers: [
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: AppAuthInterceptor, multi: true, },
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    AppMenuService,
    ConfirmationService,
    CurrencyPipe,
    DatePipe,
    DialogService,
    DynamicDialogConfig,
    ImportacaoTabelasService,
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
  ],
});