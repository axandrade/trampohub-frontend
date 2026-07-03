import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { DataView } from 'primeng/dataview';
import { Tag } from 'primeng/tag';
import { Message } from 'primeng/message';
import { Dialog } from 'primeng/dialog';
import { ButtonDirective } from 'primeng/button';
import { AuthService } from '../../../core/services/auth.service';
import { VagaService } from '../services/vaga.service';
import { Vaga } from '../models/vaga.model';
import { VagaFormComponent } from '../vaga-form/vaga-form.component';

@Component({
    selector: 'app-vagas-list',
    imports: [DataView, Tag, Message, Dialog, ButtonDirective, VagaFormComponent],
    templateUrl: './vagas-list.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './vagas-list.component.css'
})
export class VagasListComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly vagaService = inject(VagaService);

  vagas: Vaga[] = [];
  loading = true;
  errorMessage: string | null = null;
  showForm = false;
  editingVaga: Vaga | null = null;

  get isEmpresa(): boolean {
    return this.authService.isEmpresa();
  }

  ngOnInit(): void {
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
