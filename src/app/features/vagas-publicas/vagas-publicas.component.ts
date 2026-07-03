import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { DataView } from 'primeng/dataview';
import { Tag } from 'primeng/tag';
import { Message } from 'primeng/message';
import { ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Textarea } from 'primeng/textarea';
import { Avatar } from 'primeng/avatar';
import { Menu } from 'primeng/menu';
import type { MenuItem } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';
import { VagaService } from '../vagas/services/vaga.service';
import { CandidaturaService } from '../vagas/services/candidatura.service';
import { Vaga } from '../vagas/models/vaga.model';
import { LogoComponent } from '../../shared/ui/logo/logo.component';

@Component({
  selector: 'app-vagas-publicas',
  imports: [
    RouterLink,
    FormsModule,
    DataView,
    Tag,
    Message,
    ButtonDirective,
    Dialog,
    Textarea,
    Avatar,
    Menu,
    LogoComponent,
  ],
  templateUrl: './vagas-publicas.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './vagas-publicas.component.css',
})
export class VagasPublicasComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly vagaService = inject(VagaService);
  private readonly candidaturaService = inject(CandidaturaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  vagas: Vaga[] = [];
  loading = true;
  errorMessage: string | null = null;

  candidaturasEnviadas = new Set<string>();
  candidaturaVaga: Vaga | null = null;
  candidaturaMensagem = '';
  candidaturaLoading = false;
  candidaturaError: string | null = null;

  readonly userMenuItems: MenuItem[] = [
    { label: 'Ir para o painel', icon: 'pi pi-home', routerLink: '/home' },
    { label: 'Editar perfil', icon: 'pi pi-user-edit', routerLink: '/perfil/editar' },
    { separator: true },
    { label: 'Sair', icon: 'pi pi-sign-out', command: () => this.logout() },
  ];

  get isEmpresa(): boolean {
    return this.authService.isEmpresa();
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  get username(): string | null {
    return this.authService.getUsername();
  }

  get initials(): string {
    const username = this.username;
    return username ? username.charAt(0).toUpperCase() : '?';
  }

  logout(): void {
    this.authService.logout();
  }

  ngOnInit(): void {
    const podeTerCandidatado = this.authService.isAuthenticated() && !this.isEmpresa;

    forkJoin({
      vagas: this.vagaService.list(),
      candidaturas: podeTerCandidatado ? this.candidaturaService.list() : of([]),
    }).subscribe({
      next: ({ vagas, candidaturas }) => {
        this.vagas = vagas;
        this.candidaturasEnviadas = new Set(candidaturas.map((c) => c.vaga));
        this.loading = false;
        this.abrirCandidaturaPendente();
      },
      error: () => {
        this.errorMessage = 'Não foi possível carregar as vagas agora. Tente novamente em instantes.';
        this.loading = false;
      },
    });
  }

  private abrirCandidaturaPendente(): void {
    const vagaId = this.route.snapshot.queryParamMap.get('candidatar');
    if (!vagaId || !this.authService.isAuthenticated() || this.isEmpresa || this.candidaturasEnviadas.has(vagaId)) {
      return;
    }
    const vaga = this.vagas.find((v) => v.id === vagaId);
    if (vaga) {
      this.candidatarVaga(vaga);
    }
    this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
  }

  candidatarVaga(vaga: Vaga): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/vagas-publicas?candidatar=${vaga.id}` } });
      return;
    }
    if (this.candidaturasEnviadas.has(vaga.id)) {
      return;
    }
    this.candidaturaVaga = vaga;
    this.candidaturaMensagem = '';
    this.candidaturaError = null;
  }

  fecharCandidatura(): void {
    this.candidaturaVaga = null;
  }

  confirmarCandidatura(): void {
    if (!this.candidaturaVaga) {
      return;
    }
    this.candidaturaLoading = true;
    this.candidaturaError = null;

    this.candidaturaService
      .create({ vaga: this.candidaturaVaga.id, mensagem: this.candidaturaMensagem || undefined })
      .subscribe({
        next: () => {
          this.candidaturaLoading = false;
          this.candidaturasEnviadas.add(this.candidaturaVaga!.id);
          this.candidaturaVaga = null;
        },
        error: (error: HttpErrorResponse) => {
          this.candidaturaLoading = false;
          this.candidaturaError = this.extractErrorMessage(error);
        },
      });
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    const body = error.error;
    if (typeof body === 'string') {
      return body;
    }
    if (Array.isArray(body) && body.length) {
      return String(body[0]);
    }
    if (body && typeof body === 'object') {
      const firstValue = Object.values(body)[0];
      if (Array.isArray(firstValue) && firstValue.length) {
        return String(firstValue[0]);
      }
      if (typeof firstValue === 'string') {
        return firstValue;
      }
    }
    return 'Não foi possível enviar sua candidatura agora. Tente novamente em instantes.';
  }
}
