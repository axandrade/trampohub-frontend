import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputPassword } from 'primeng/inputpassword';
import { Message } from 'primeng/message';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { AuthService, PerfilResponse } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

function senhasValidator(group: AbstractControl): ValidationErrors | null {
  const senhaAtual = group.get('senha_atual')?.value;
  const novaSenha = group.get('nova_senha')?.value;
  const confirmar = group.get('confirmar_nova_senha')?.value;

  const errors: ValidationErrors = {};
  if (novaSenha) {
    if (!senhaAtual) {
      errors['senhaAtualObrigatoria'] = true;
    }
    if (novaSenha !== confirmar) {
      errors['senhasDiferentes'] = true;
    }
  }
  return Object.keys(errors).length ? errors : null;
}

@Component({
  selector: 'app-perfil-editar',
  imports: [ReactiveFormsModule, ButtonDirective, InputText, InputPassword, Message, ImageCropperComponent],
  templateUrl: './perfil-editar.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './perfil-editar.component.css',
})
export class PerfilEditarComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly router = inject(Router);

  loadingPerfil = true;
  loading = false;
  success = false;
  errorMessage: string | null = null;
  passwordMasked = true;
  novaSenhaMasked = true;

  isCandidato = false;
  isEmpresa = false;

  selectedFoto: File | null = null;
  previewUrl: SafeUrl | null = null;
  private previewObjectUrl: string | null = null;

  cropperImageChangedEvent: Event | null = null;
  private latestCroppedBlob: Blob | null = null;

  form = this.fb.nonNullable.group(
    {
      username: ['', Validators.required],
      email: ['', Validators.email],
      nome_empresa: [''],
      senha_atual: [''],
      nova_senha: ['', Validators.minLength(6)],
      confirmar_nova_senha: [''],
    },
    { validators: [senhasValidator] },
  );

  ngOnInit(): void {
    this.authService.getPerfil().subscribe({
      next: (perfil) => this.preencherForm(perfil),
      error: () => {
        this.errorMessage = 'Não foi possível carregar seus dados agora. Tente novamente em instantes.';
        this.loadingPerfil = false;
      },
    });
  }

  private preencherForm(perfil: PerfilResponse): void {
    this.isCandidato = perfil.tipo === 'candidato';
    this.isEmpresa = perfil.tipo === 'empregador';
    this.form.patchValue({
      username: perfil.username,
      email: perfil.email ?? '',
      nome_empresa: perfil.nome_empresa ?? '',
    });
    if (perfil.foto) {
      this.previewUrl = this.sanitizer.bypassSecurityTrustUrl(`${environment.serverUrl}${perfil.foto}`);
    }
    this.loadingPerfil = false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }
    this.latestCroppedBlob = null;
    this.cropperImageChangedEvent = event;
  }

  onImageCropped(event: ImageCroppedEvent): void {
    this.latestCroppedBlob = event.blob ?? null;
  }

  onLoadImageFailed(): void {
    this.cropperImageChangedEvent = null;
    this.errorMessage = 'Não foi possível carregar essa imagem. Tente outro arquivo.';
  }

  confirmCrop(): void {
    if (!this.latestCroppedBlob) {
      return;
    }
    this.selectedFoto = new File([this.latestCroppedBlob], 'foto-perfil.png', { type: 'image/png' });

    if (this.previewObjectUrl) {
      URL.revokeObjectURL(this.previewObjectUrl);
    }
    this.previewObjectUrl = URL.createObjectURL(this.latestCroppedBlob);
    this.previewUrl = this.sanitizer.bypassSecurityTrustUrl(this.previewObjectUrl);

    this.cropperImageChangedEvent = null;
    this.latestCroppedBlob = null;
  }

  cancelCrop(): void {
    this.cropperImageChangedEvent = null;
    this.latestCroppedBlob = null;
  }

  cancelar(): void {
    this.router.navigateByUrl('/home');
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.success = false;

    const { username, email, nome_empresa, senha_atual, nova_senha } = this.form.getRawValue();

    this.authService
      .updatePerfil({
        username,
        email: this.isCandidato ? email : undefined,
        nome_empresa: this.isEmpresa ? nome_empresa : undefined,
        foto: this.selectedFoto,
        senha_atual: senha_atual || undefined,
        nova_senha: nova_senha || undefined,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.success = true;
          this.selectedFoto = null;
          this.form.patchValue({ senha_atual: '', nova_senha: '', confirmar_nova_senha: '' });
          this.form.markAsPristine();
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          this.errorMessage = this.extractErrorMessage(error);
        },
      });
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    const body = error.error as Record<string, string[]> | undefined;
    const fieldError =
      body?.['username']?.[0] ??
      body?.['email']?.[0] ??
      body?.['nome_empresa']?.[0] ??
      body?.['foto']?.[0] ??
      body?.['senha_atual']?.[0] ??
      body?.['nova_senha']?.[0];
    return fieldError ?? 'Não foi possível salvar suas alterações agora. Tente novamente em instantes.';
  }
}
