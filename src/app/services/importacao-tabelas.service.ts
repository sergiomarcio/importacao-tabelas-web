import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { TabelaServidorSciModel } from "../models/tabela-servidor-sci.model";

export interface ResultadoExcel {
  dataAtualizacao?: string;
  nomeTabela?: string;
  registrosExportados?: number;
  registrosImportados?: number;
  arquivo?: string;
  mensagem?: string;
  message?: string;
}
@Injectable()
export class ImportacaoTabelasService {
  getPermissaoExportacao(): Observable<{ maquina: string; permitida: boolean }> {
    return this.http.get<{ maquina: string; permitida: boolean }>(environment.integraHost + 'importacao-tabelas/permissao-exportacao');
  }

  constructor(
    private http: HttpClient,
  ) { }

  getListaTabelasServidorSci(): Observable<TabelaServidorSciModel[]> {
    const url = environment.integraHost + 'importacao-tabelas/lista-tabelas';
    return this.http.get<TabelaServidorSciModel[]>(url);
  }

  getListaTabelasServidorSciPorGrupo(grupo: string): Observable<TabelaServidorSciModel[]> {
    const url = environment.integraHost + 'importacao-tabelas/lista-tabelas/grupo/' + encodeURIComponent(grupo);
    return this.http.get<TabelaServidorSciModel[]>(url);
  }

  getListaTabelasServidorSciPorNomeTabela(nometabela: string): Observable<TabelaServidorSciModel> {
    const url = environment.integraHost + 'importacao-tabelas/tabela/' + encodeURIComponent(nometabela);
    return this.http.get<TabelaServidorSciModel>(url);
  }

  incluirTabelasServidorSci(registro: TabelaServidorSciModel): Observable<TabelaServidorSciModel> {
    const url = environment.integraHost + 'importacao-tabelas';
    const body = { nome_tabela: registro.nomeTabela, grupo: registro.grupo };
    return this.http.post<TabelaServidorSciModel>(url, body);
  }

  excluirTabelasServidorSci(id: number): Observable<void> {
    const url = environment.integraHost + 'importacao-tabelas/' + id;
    return this.http.delete<void>(url);
  }

  importarDoExcel(nometabela: string): Observable<ResultadoExcel> {
    const url = environment.integraHost + 'importacao-tabelas/importar-do-excel?nomeTabela=' + encodeURIComponent(nometabela);
    return this.http.post<any>(url, null);
  }

  exportarParaExcel(nometabela: string): Observable<ResultadoExcel> {
    const url = environment.integraHost + 'importacao-tabelas/exportar-para-excel?nomeTabela=' + encodeURIComponent(nometabela);
    return this.http.post<any>(url, null);
  }

}




