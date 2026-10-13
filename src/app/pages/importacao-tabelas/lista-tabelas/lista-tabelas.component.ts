import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Subject, catchError, concatMap, finalize, from, map, of, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';
import { TabelaServidorSciModel } from '../../../models/tabela-servidor-sci.model';
import { ImportacaoTabelasService } from '../../../services/importacao-tabelas.service';

interface ResultadoImportacao {
  dataAtualizacao?: string;
  nomeTabela: string;
  sucesso: boolean;
  mensagem: string;
}

@Component({
  selector: 'app-lista-tabelas',
  standalone: true,
  imports: [FormsModule, TableModule, ButtonModule, DatePipe],
  templateUrl: './lista-tabelas.component.html',
  styleUrls: ['./lista-tabelas.component.scss']
})
export class ListaTabelasComponent implements OnInit, OnDestroy {
  @Input() operacao: 'importacao' | 'exportacao' = 'importacao';
  get exportacao(): boolean { return this.operacao === 'exportacao'; }
  private destroy = new Subject<void>();
  tabelas: TabelaServidorSciModel[] = [];
  selecionadas: TabelaServidorSciModel[] = [];
  grupos: string[] = [];
  grupo = '';
  busca = '';
  carregando = false;
  importando = false;
  confirmando = false;
  erro = '';
  exportacaoPermitida = false;
  avisoExportacao = 'Verificando permissão para exportar...';
  resultados: ResultadoImportacao[] = [];
  totalImportacao = 0;
  constructor(private service: ImportacaoTabelasService) {}
  ngOnInit(): void {
    this.carregar();
    if (this.exportacao) {
      this.service.getPermissaoExportacao().pipe(takeUntil(this.destroy)).subscribe({
        next: permissao => {
          this.exportacaoPermitida = permissao.permitida === true;
          this.avisoExportacao = this.exportacaoPermitida ? '' :
            'Exportação bloqueada na máquina ' + permissao.maquina + '. Permitida somente na STJ220579.';
        },
        error: () => {
          this.exportacaoPermitida = false;
          this.avisoExportacao = 'Não foi possível verificar a máquina. A exportação está bloqueada. Atualize a página após verificar a API.';
        }
      });
    }
  }
  ngOnDestroy(): void { this.destroy.next(); this.destroy.complete(); }
  get tabelasFiltradas(): TabelaServidorSciModel[] {
    const busca = this.busca.trim().toLocaleLowerCase('pt-BR');
    return this.tabelas.filter(tabela =>
      (!this.grupo || (tabela.grupo || 'Sem grupo') === this.grupo) &&
      (!busca || tabela.nomeTabela.toLocaleLowerCase('pt-BR').includes(busca)));
  }
  carregar(): void {
    if (this.carregando || this.importando || this.confirmando) { return; }
    this.carregando = true;
    this.erro = '';
    this.service.getListaTabelasServidorSci().pipe(
      takeUntil(this.destroy), finalize(() => this.carregando = false)
    ).subscribe({
      next: tabelas => {
        this.tabelas = tabelas.filter(tabela => !!tabela.nomeTabela);
        this.grupos = [...new Set(this.tabelas.map(tabela => tabela.grupo || 'Sem grupo'))]
          .sort((a, b) => a.localeCompare(b, 'pt-BR'));
        this.selecionadas = [];
        if (!this.grupos.includes(this.grupo)) { this.grupo = ''; }
      },
      error: () => this.erro = 'Não foi possível carregar as tabelas. Verifique a conexão com a API e tente novamente.'
    });
  }
  async importarSelecionadas(): Promise<void> {
    if (this.exportacao && !this.exportacaoPermitida) { return; }
    if (!this.selecionadas.length || this.importando || this.confirmando) { return; }
    const tabelas = [...this.selecionadas];
    this.confirmando = true;
    const confirmacao = await Swal.fire({
      icon: 'warning', title: this.exportacao ? 'Gerar arquivos Excel?' : 'Importar tabelas selecionadas?',
      text: (this.exportacao ? 'Será gerado um arquivo Excel por tabela no servidor, substituindo a planilha existente. Tabelas: ' : 'Os dados atuais de cada tabela serão apagados e substituídos pelo Excel disponível no servidor. Tabelas: ') +
        tabelas.map(tabela => tabela.nomeTabela).join(', '),
      showCancelButton: true, confirmButtonText: this.exportacao ? 'Gerar Excel' : 'Importar', cancelButtonText: 'Cancelar'
    });
    this.confirmando = false;
    if (!confirmacao.isConfirmed || this.destroy.isStopped) { return; }
    this.importando = true;
    this.resultados = [];
    this.totalImportacao = tabelas.length;
    from(tabelas).pipe(
      concatMap(tabela => (this.exportacao ? this.service.exportarParaExcel(tabela.nomeTabela) : this.service.importarDoExcel(tabela.nomeTabela)).pipe(
        map(resposta => ({
          dataAtualizacao: resposta.dataAtualizacao,
          nomeTabela: tabela.nomeTabela, sucesso: true,
          mensagem: this.exportacao ? (resposta.registrosExportados ?? 0) + ' registro(s) exportado(s). Arquivo: ' + (resposta.arquivo || 'Gerado no servidor.') : resposta?.mensagem || resposta?.message || (typeof resposta?.['registrosImportados'] === 'number' ? resposta['registrosImportados'] + ' registro(s) importado(s).' : 'Importação concluída.')
        })),
        catchError(error => of({
          nomeTabela: tabela.nomeTabela, sucesso: false,
          mensagem: typeof error.error?.message === 'string' ? error.error.message :
            typeof error.error?.mensagem === 'string' ? error.error.mensagem :
            this.exportacao ? 'Não foi possível gerar o Excel desta tabela. Verifique a API.' : 'Não foi possível importar esta tabela. Verifique a API e a planilha no servidor.'
        }))
      )),
      takeUntil(this.destroy), finalize(() => this.importando = false)
    ).subscribe((resultado: ResultadoImportacao) => {
      this.resultados = [...this.resultados, resultado];
      if (resultado.sucesso) {
        if (!this.exportacao && resultado.dataAtualizacao) {
          this.tabelas = this.tabelas.map(tabela => tabela.nomeTabela === resultado.nomeTabela
            ? { ...tabela, dataAtualizacao: resultado.dataAtualizacao } : tabela);
        }
        this.selecionadas = this.selecionadas.filter(tabela => tabela.nomeTabela !== resultado.nomeTabela);
      }
    });
  }
}




