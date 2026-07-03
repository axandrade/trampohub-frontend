import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { Message } from 'primeng/message';
import { AuthService } from '../../../core/services/auth.service';
import { VagaService } from '../services/vaga.service';

@Component({
    selector: 'app-vaga-form',
    imports: [ReactiveFormsModule, ButtonDirective, InputText, Textarea, Select, Message],
    templateUrl: './vaga-form.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './vaga-form.component.css'
})
export class VagaFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly vagaService = inject(VagaService);
  private readonly router = inject(Router);

  readonly tipoContratoOptions = [
    { label: 'CLT', value: 'CLT' },
    { label: 'PJ', value: 'PJ' },
    { label: 'Freelance', value: 'Freelance' },
    { label: 'Estágio', value: 'Estágio' },
  ];

  readonly modalidadeOptions = [
    { label: 'Presencial', value: 'Presencial' },
    { label: 'Remoto', value: 'Remoto' },
    { label: 'Híbrido', value: 'Híbrido' },
  ];

  loading = false;
  errorMessage: string | null = null;

  form = this.fb.nonNullable.group({
    titulo: ['', Validators.required],
    descricao: ['', Validators.required],
    empresa: [this.authService.getNomeEmpresa() ?? '', Validators.required],
    localizacao: [''],
    salario: [''],
    tipo_contrato: [''],
    modalidade: [''],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const { titulo, descricao, empresa, localizacao, salario, tipo_contrato, modalidade } =
      this.form.getRawValue();

    this.vagaService
      .create({
        titulo,
        descricao,
        empresa,
        localizacao: localizacao || undefined,
        salario: salario || undefined,
        tipo_contrato: tipo_contrato || undefined,
        modalidade: modalidade || undefined,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigateByUrl('/vagas');
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          this.errorMessage = this.extractErrorMessage(error);
        },
      });
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    const body = error.error as Record<string, string[]> | undefined;
    const fieldError = body?.['titulo']?.[0] ?? body?.['descricao']?.[0] ?? body?.['empresa']?.[0];
    return fieldError ?? 'Não foi possível cadastrar a vaga agora. Tente novamente em instantes.';
  }
}
