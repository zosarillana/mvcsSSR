import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { Isr } from '../../../../../../../models/isr';
import { IsrService } from '../../../../../../../services/isr.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-create-isr',
  templateUrl: './modal-create-isr.component.html',
  styleUrls: ['./modal-create-isr.component.css']
})
export class ModalCreateIsrComponent {
  imageFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;  
  @Input() area?: Isr;
  @Output() IsrUpdated = new EventEmitter<Isr[]>();

  errorMessages: { [key: string]: string[] } = {};

  constructor(
    private isrService: IsrService,
    public dialogRef: MatDialogRef<ModalCreateIsrComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  save(): void {
    if (this.data) {
      const formData = new FormData();
  
      // Append form fields
      formData.append('isr_name', this.data.isrName);
      const othersValue = this.data.others && this.data.others.trim() ? this.data.others : 'N/A';
      formData.append('isr_others', othersValue);
      formData.append('isr_type', this.data.type);
      formData.append('description', this.data.description);
  
      // Append image file or default image
      if (this.imageFile) {
        formData.append('file', this.imageFile);
        this.submitFormData(formData);
      } else {
        // Create a default image Blob
        fetch('/no_img.jpg')
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok.');
            }
            return response.blob();
          })
          .then(blob => {
            formData.append('file', blob, 'no_img.jpg');
            this.submitFormData(formData);
          })
          .catch(error => {
            console.error('Error fetching default image:', error);
            this.errorMessages['general'] = ['Failed to load default image.'];
          });
      }
    } else {
      console.log('No data provided.');
    }
  }
  
  private submitFormData(formData: FormData): void {
    this.isrService.createIsrs(formData).subscribe({
      next: (response) => {
        this.dialogRef.close(this.data);
      },
      error: (errorResponse) => {
        console.log('Error Response:', errorResponse);
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
}
