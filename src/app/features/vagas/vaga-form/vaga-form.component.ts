import { Component, Input, OnInit, inject, output, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { Message } from 'primeng/message';
import { AuthService } from '../../../core/services/auth.service';
import { VagaService } from '../services/vaga.service';
import { Vaga } from '../models/vaga.model';

@Component({
    selector: 'app-vaga-form',
    imports: [ReactiveFormsModule, ButtonDirective, InputText, Textarea, Select, Message],
    templateUrl: './vaga-form.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './vaga-form.component.css'
})
export class VagaFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly vagaService = inject(VagaService);

  @Input() vaga: Vaga | null = null;

  readonly saved = output<Vaga>();
  readonly cancelled = output<void>();

  get isEdicao(): boolean {
    return !!this.vaga;
  }

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
    empresa: [{ value: this.authService.getNomeEmpresa() ?? '', disabled: true }, Validators.required],
    localizacao: [''],
    salario: [''],
    tipo_contrato: [''],
    modalidade: [''],
  });

  ngOnInit(): void {
    if (this.vaga) {
      this.form.patchValue({
        titulo: this.vaga.titulo,
        descricao: this.vaga.descricao,
        localizacao: this.vaga.localizacao ?? '',
        salario: this.vaga.salario ?? '',
        tipo_contrato: this.vaga.tipo_contrato ?? '',
        modalidade: this.vaga.modalidade ?? '',
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const { titulo, descricao, empresa, localizacao, salario, tipo_contrato, modalidade } =
      this.form.getRawValue();

    const payload = {
      titulo,
      descricao,
      empresa,
      localizacao: localizacao || undefined,
      salario: salario || undefined,
      tipo_contrato: tipo_contrato || undefined,
      modalidade: modalidade || undefined,
    };

    const request$ = this.vaga ? this.vagaService.update(this.vaga.id, payload) : this.vagaService.create(payload);

    request$.subscribe({
      next: (vaga) => {
        this.loading = false;
        this.saved.emit(vaga);
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.errorMessage = this.extractErrorMessage(error);
      },
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    const body = error.error as Record<string, string[]> | undefined;
    const fieldError = body?.['titulo']?.[0] ?? body?.['descricao']?.[0] ?? body?.['empresa']?.[0];
    return fieldError ?? 'Não foi possível cadastrar a vaga agora. Tente novamente em instantes.';
  }
}
