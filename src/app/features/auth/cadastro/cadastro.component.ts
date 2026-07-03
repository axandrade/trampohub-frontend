import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Message } from 'primeng/message';
import { SelectButton } from 'primeng/selectbutton';
import { AuthService } from '../../../core/services/auth.service';
import { LogoComponent } from '../../../shared/ui/logo/logo.component';

@Component({
    selector: 'app-cadastro',
    imports: [ReactiveFormsModule, RouterLink, LogoComponent, Button, InputText, Password, Message, SelectButton],
    templateUrl: './cadastro.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './cadastro.component.css'
})
export class CadastroComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly tipoOptions = [
    { label: 'Candidato', value: 'candidato' as const },
    { label: 'Empresa', value: 'empregador' as const },
  ];

  loading = false;
  success = false;
  errorMessage: string | null = null;

  form = this.fb.nonNullable.group({
    tipo: ['candidato' as 'candidato' | 'empregador', Validators.required],
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    nome_empresa: [''],
  });

  get isEmpregador(): boolean {
    return this.form.controls.tipo.value === 'empregador';
  }

  submit(): void {
    const nomeEmpresaControl = this.form.controls.nome_empresa;
    if (this.isEmpregador) {
      nomeEmpresaControl.addValidators(Validators.required);
    } else {
      nomeEmpresaControl.clearValidators();
    }
    nomeEmpresaControl.updateValueAndValidity();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const { tipo, username, password, nome_empresa } = this.form.getRawValue();

    this.authService
      .register({
        tipo,
        username,
        password,
        nome_empresa: tipo === 'empregador' ? nome_empresa : undefined,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.success = true;
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          this.errorMessage = this.extractErrorMessage(error);
        },
      });
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    const body = error.error as Record<string, string[]> | undefined;
    const fieldError = body?.['username']?.[0] ?? body?.['password']?.[0] ?? body?.['nome_empresa']?.[0];
    return fieldError ?? 'Não foi possível concluir o cadastro agora. Tente novamente em instantes.';
  }
}
