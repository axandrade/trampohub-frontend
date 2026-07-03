import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputPassword } from 'primeng/inputpassword';
import { Message } from 'primeng/message';
import { SelectButton } from 'primeng/selectbutton';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { AuthService } from '../../../core/services/auth.service';
import { LogoComponent } from '../../../shared/ui/logo/logo.component';

@Component({
    selector: 'app-cadastro',
    imports: [
        ReactiveFormsModule,
        RouterLink,
        LogoComponent,
        ButtonDirective,
        InputText,
        InputPassword,
        Message,
        SelectButton,
        ImageCropperComponent,
    ],
    templateUrl: './cadastro.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './cadastro.component.css'
})
export class CadastroComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly tipoOptions = [
    { label: 'Candidato', value: 'candidato' as const },
    { label: 'Empresa', value: 'empregador' as const },
  ];

  loading = false;
  success = false;
  errorMessage: string | null = null;
  passwordMasked = true;

  selectedFoto: File | null = null;
  previewUrl: SafeUrl | null = null;
  fotoError: string | null = null;
  fotoTouched = false;

  cropperImageChangedEvent: Event | null = null;
  private latestCroppedBlob: Blob | null = null;
  private previewObjectUrl: string | null = null;

  form = this.fb.nonNullable.group({
    tipo: ['candidato' as 'candidato' | 'empregador', Validators.required],
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    nome_empresa: [''],
  });

  get isEmpregador(): boolean {
    return this.form.controls.tipo.value === 'empregador';
  }

  get isCandidato(): boolean {
    return this.form.controls.tipo.value === 'candidato';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }
    this.fotoError = null;
    this.latestCroppedBlob = null;
    this.cropperImageChangedEvent = event;
  }

  onImageCropped(event: ImageCroppedEvent): void {
    this.latestCroppedBlob = event.blob ?? null;
  }

  onLoadImageFailed(): void {
    this.cropperImageChangedEvent = null;
    this.fotoTouched = true;
    this.fotoError = 'Não foi possível carregar essa imagem. Tente outro arquivo.';
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
    this.fotoTouched = true;
    this.validateFoto();
  }

  cancelCrop(): void {
    this.cropperImageChangedEvent = null;
    this.latestCroppedBlob = null;
  }

  removeFoto(): void {
    this.selectedFoto = null;
    if (this.previewObjectUrl) {
      URL.revokeObjectURL(this.previewObjectUrl);
    }
    this.previewObjectUrl = null;
    this.previewUrl = null;
    this.fotoTouched = true;
    this.validateFoto();
  }

  private validateFoto(): boolean {
    if (this.isCandidato && !this.selectedFoto) {
      this.fotoError = 'A foto é obrigatória para candidatos.';
      return false;
    }
    this.fotoError = null;
    return true;
  }

  submit(): void {
    const nomeEmpresaControl = this.form.controls.nome_empresa;
    if (this.isEmpregador) {
      nomeEmpresaControl.addValidators(Validators.required);
    } else {
      nomeEmpresaControl.clearValidators();
    }
    nomeEmpresaControl.updateValueAndValidity();

    this.fotoTouched = true;
    const fotoValid = this.validateFoto();

    if (this.form.invalid || !fotoValid) {
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
        foto: tipo === 'candidato' ? this.selectedFoto : undefined,
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
    const fieldError =
      body?.['username']?.[0] ?? body?.['password']?.[0] ?? body?.['nome_empresa']?.[0] ?? body?.['foto']?.[0];
    return fieldError ?? 'Não foi possível concluir o cadastro agora. Tente novamente em instantes.';
  }
}
