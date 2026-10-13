import { FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { ImportacaoTabelasLoginComponent } from './app.login.component';

describe('Login', () => {
  it('valida os campos e impede submissões duplicadas', () => {
    const request = new Subject<any>();
    const auth = { desenvolvimentoLocal: false, login: jasmine.createSpy().and.returnValue(request) };
    const router = { navigate: jasmine.createSpy() };
    const component = new ImportacaoTabelasLoginComponent(new FormBuilder(), auth as any, router as any);
    component.fazerLogin();
    expect(auth.login).not.toHaveBeenCalled();
    component.loginFormGroup.setValue({ usuario: ' smarcio ', password: 'senha' });
    component.fazerLogin();
    component.fazerLogin();
    expect(auth.login).toHaveBeenCalledTimes(1);
    expect(auth.login).toHaveBeenCalledWith('smarcio', 'senha');
    request.next({});
    request.complete();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(component.spinnerVisivel).toBeFalse();
    component.ngOnDestroy();
  });
});
