import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataView } from 'primeng/dataview';
import { Tag } from 'primeng/tag';
import { Message } from 'primeng/message';
import { Dialog } from 'primeng/dialog';
import { ButtonDirective } from 'primeng/button';
import { AuthService } from '../../../core/services/auth.service';
import { VagaService } from '../services/vaga.service';
import { CandidaturaService } from '../services/candidatura.service';
import { Vaga } from '../models/vaga.model';
import { Candidatura } from '../models/candidatura.model';
import { VagaFormComponent } from '../vaga-form/vaga-form.component';

const STATUS_SEVERIDADE: Record<string, 'warn' | 'info' | 'success' | 'danger' | 'secondary'> = {
  Pendente: 'warn',
  'Em analise': 'info',
  Aprovado: 'success',
  Rejeitado: 'danger',
  Aberta: 'success',
  Expirada: 'secondary',
};

@Component({
    selector: 'app-vagas-list',
    imports: [RouterLink, DatePipe, DataView, Tag, Message, Dialog, ButtonDirective, VagaFormComponent],
    templateUrl: './vagas-list.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './vagas-list.component.css'
})
export class VagasListComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly vagaService = inject(VagaService);
  private readonly candidaturaService = inject(CandidaturaService);

  vagas: Vaga[] = [];
  candidaturas: Candidatura[] = [];
  loading = true;
  errorMessage: string | null = null;
  showForm = false;
  editingVaga: Vaga | null = null;

  get isEmpresa(): boolean {
    return this.authService.isEmpresa();
  }

  ngOnInit(): void {
    if (this.isEmpresa) {
      this.vagaService.list().subscribe({
        next: (vagas) => {
          this.vagas = vagas;
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'Não foi possível carregar as vagas agora. Tente novamente em instantes.';
          this.loading = false;
        },
      });
    } else {
      this.candidaturaService.list().subscribe({
        next: (candidaturas) => {
          this.candidaturas = candidaturas;
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'Não foi possível carregar suas candidaturas agora. Tente novamente em instantes.';
          this.loading = false;
        },
      });
    }
  }

  statusSeverity(status: string): 'warn' | 'info' | 'success' | 'danger' | 'secondary' {
    return STATUS_SEVERIDADE[status] ?? 'secondary';
  }

  openNewVagaForm(): void {
    this.editingVaga = null;
    this.showForm = true;
  }

  openEditVagaForm(vaga: Vaga): void {
    this.editingVaga = vaga;
    this.showForm = true;
  }

  onVagaSaved(vaga: Vaga): void {
    if (this.editingVaga) {
      this.vagas = this.vagas.map((v) => (v.id === vaga.id ? vaga : v));
    } else {
      this.vagas = [vaga, ...this.vagas];
    }
    this.showForm = false;
  }
}
