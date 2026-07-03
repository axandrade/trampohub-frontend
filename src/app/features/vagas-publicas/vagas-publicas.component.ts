import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataView } from 'primeng/dataview';
import { Tag } from 'primeng/tag';
import { Message } from 'primeng/message';
import { ButtonDirective } from 'primeng/button';
import { VagaService } from '../vagas/services/vaga.service';
import { Vaga } from '../vagas/models/vaga.model';
import { LogoComponent } from '../../shared/ui/logo/logo.component';

@Component({
  selector: 'app-vagas-publicas',
  imports: [RouterLink, DataView, Tag, Message, ButtonDirective, LogoComponent],
  templateUrl: './vagas-publicas.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './vagas-publicas.component.css',
})
export class VagasPublicasComponent implements OnInit {
  private readonly vagaService = inject(VagaService);

  vagas: Vaga[] = [];
  loading = true;
  errorMessage: string | null = null;

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
}
