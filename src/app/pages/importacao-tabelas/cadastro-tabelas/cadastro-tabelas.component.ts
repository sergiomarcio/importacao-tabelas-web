import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Subject, finalize, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';
import { TabelaServidorSciModel } from '../../../models/tabela-servidor-sci.model';
import { ImportacaoTabelasService } from '../../../services/importacao-tabelas.service';

@Component({
  selector: 'app-cadastro-tabelas',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, ButtonModule, TableModule, DatePipe],
  templateUrl: './cadastro-tabelas.component.html',
  styleUrls: ['../lista-tabelas/lista-tabelas.component.scss', './cadastro-tabelas.component.scss']
})
export class CadastroTabelasComponent implements OnInit, OnDestroy {
  private destroy = new Subject<void>();
  private encerrado = false;
  tabelas: TabelaServidorSciModel[] = [];
  carregando = false;
  salvando = false;
  confirmando = false;
  erro = '';
  mensagem = '';
  busca = '';
  grupo = '';
  form = this.fb.nonNullable.group({
    nomeTabela: ['', [Validators.required, Validators.pattern(/^[A-Za-z_][A-Za-z0-9_]{0,127}$/)]],
    grupo: ['', [Validators.required, Validators.pattern(/\S/)]]
  });
  constructor(private fb: FormBuilder, private service: ImportacaoTabelasService) {}
  ngOnInit(): void { this.carregar(); }
  ngOnDestroy(): void { this.encerrado = true; this.destroy.next(); this.destroy.complete(); }
  get ocupado(): boolean { return this.carregando || this.salvando || this.confirmando; }
  get grupos(): string[] {
    return [...new Set(this.tabelas.map(t => t.grupo).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }
  get filtradas(): TabelaServidorSciModel[] {
    const busca = this.busca.trim().toLocaleLowerCase('pt-BR');
    return this.tabelas.filter(t => (!this.grupo || t.grupo === this.grupo) &&
      (!busca || (t.nomeTabela || '').toLocaleLowerCase('pt-BR').includes(busca)));
  }
  carregar(): void {
    if (this.ocupado) { return; }
    this.carregando = true;
    this.erro = '';
    this.service.getListaTabelasServidorSci().pipe(takeUntil(this.destroy), finalize(() => this.carregando = false)).subscribe({
      next: tabelas => this.tabelas = tabelas,
      error: () => this.erro = 'Não foi possível carregar o cadastro. Tente atualizar a lista.'
    });
  }
  adicionar(): void {
    if (this.ocupado) { return; }
    this.form.markAllAsTouched();
    if (this.form.invalid) { return; }
    const registro = { nomeTabela: this.form.controls.nomeTabela.value.trim(), grupo: this.form.controls.grupo.value.trim() };
    this.erro = '';
    this.mensagem = '';
    if (this.tabelas.some(t => t.nomeTabela?.toLowerCase() === registro.nomeTabela.toLowerCase())) {
      this.erro = 'Esta tabela já está cadastrada.';
      return;
    }
    this.salvando = true;
    this.service.incluirTabelasServidorSci(registro).pipe(takeUntil(this.destroy), finalize(() => this.salvando = false)).subscribe({
      next: tabela => {
        this.tabelas = [...this.tabelas, tabela];
        this.form.reset();
        this.busca = '';
        this.grupo = '';
        this.mensagem = 'Tabela adicionada com sucesso.';
      },
      error: () => this.erro = 'Não foi possível adicionar a tabela. Verifique os dados e tente novamente.'
    });
  }
  async excluir(tabela: TabelaServidorSciModel): Promise<void> {
    if (this.ocupado || tabela.id == null) { return; }
    this.confirmando = true;
    const resposta = await Swal.fire({
      icon: 'warning', title: 'Excluir tabela do cadastro?',
      text: 'A tabela ' + tabela.nomeTabela + ' será removida da lista de importação e exportação. Os dados da tabela no banco serão mantidos.',
      showCancelButton: true, confirmButtonText: 'Excluir', cancelButtonText: 'Cancelar'
    });
    this.confirmando = false;
    if (!resposta.isConfirmed || this.encerrado) { return; }
    this.salvando = true;
    this.erro = '';
    this.mensagem = '';
    this.service.excluirTabelasServidorSci(tabela.id).pipe(takeUntil(this.destroy), finalize(() => this.salvando = false)).subscribe({
      next: () => {
        this.tabelas = this.tabelas.filter(t => t.id !== tabela.id);
        this.mensagem = 'Tabela excluída do cadastro.';
      },
      error: () => this.erro = 'Não foi possível excluir a tabela. Tente novamente.'
    });
  }
}
