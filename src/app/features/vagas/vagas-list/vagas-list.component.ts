import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { DataView } from 'primeng/dataview';
import { Tag } from 'primeng/tag';
import { Message } from 'primeng/message';
import { VagaService } from '../services/vaga.service';
import { Vaga } from '../models/vaga.model';

@Component({
    selector: 'app-vagas-list',
    imports: [DataView, Tag, Message],
    templateUrl: './vagas-list.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './vagas-list.component.css'
})
export class VagasListComponent implements OnInit {
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
