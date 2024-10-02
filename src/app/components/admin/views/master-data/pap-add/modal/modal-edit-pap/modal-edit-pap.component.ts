import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { PodService } from '../../../../../../../services/pod.service';
import { ConfirmDialogComponent } from '../../../../user/user-add/modal/modal-edit-user-dialog/confirm-dialog/confirm-dialog.component';
import { ModalEditPodComponent } from '../../../pod-add/modal/modal-edit-pod/modal-edit-pod.component';
import { Pap } from '../../../../../../../models/pap';
import { PapService } from '../../../../../../../services/pap.service';

@Component({
  selector: 'app-modal-edit-pap',
  templateUrl: './modal-edit-pap.component.html',
  styleUrl: './modal-edit-pap.component.css'
})
export class ModalEditPapComponent {
  @Input() pod?: Pap;
  @Output() PodUpdated = new EventEmitter<Pap[]>();

  imageFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  errorMessages: { [key: string]: string[] } = {};

  constructor(
    private podService: PapService,
    public dialogRef: MatDialogRef<ModalEditPodComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog // Inject MatDialog service
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  openConfirmationDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.save(); // Proceed with saving if the user confirmed
      }
    });
  }
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imageFile = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.imagePreview = e.target.result;
        } else {
          this.imagePreview = null;
        }
      };

      reader.readAsDataURL(this.imageFile);
    } else {
      this.imageFile = null;
      this.imagePreview = null;
    }
  }

  save(): void {
    if (this.data) {
      const formData = new FormData();

      // Append form fields
      formData.append('id', this.data.id.toString());
      formData.append('pap_name', this.data.pap_name);
      const othersValue = this.data.others && this.data.others.trim() ? this.data.others : 'N/A';
      formData.append('pap_others', othersValue);   
      formData.append('description', this.data.description || '');

      // Append image file if available
      if (this.imageFile) {
        formData.append('file', this.imageFile);
      }

      this.podService.updatePaps(formData).subscribe({
        next: (response) => {
          this.dialogRef.close(this.data);
        },
        error: (errorResponse) => {
          // console.log('Error Response:', errorResponse);
          this.errorMessages = {};

          if (errorResponse && typeof errorResponse === 'object') {
            if (errorResponse.errors) {
              for (const [key, value] of Object.entries(errorResponse.errors)) {
                if (Array.isArray(value)) {
                  this.errorMessages[key] = value;
                } else if (typeof value === 'string') {
                  this.errorMessages[key] = [value];
                } else {
                  this.errorMessages[key] = ['Unexpected error format.'];
                }
              }
            } else if (errorResponse.message) {
              this.errorMessages['general'] = [errorResponse.message];
            } else {
              this.errorMessages['general'] = ['Unexpected error format.'];
            }
          } else {
            this.errorMessages['general'] = ['An unknown error occurred.'];
          }
        },
      });
    } else {
      // console.log('No data provided.');
    }
  }
}
