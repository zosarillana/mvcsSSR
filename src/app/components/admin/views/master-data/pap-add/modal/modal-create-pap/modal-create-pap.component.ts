import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Isr } from '../../../../../../../models/isr';
import { PodService } from '../../../../../../../services/pod.service';
import { ModalCreatePodComponent } from '../../../pod-add/modal/modal-create-pod/modal-create-pod.component';
import { Pap } from '../../../../../../../models/pap';
import { PapService } from '../../../../../../../services/pap.service';

@Component({
  selector: 'app-modal-create-pap',
  templateUrl: './modal-create-pap.component.html',
  styleUrl: './modal-create-pap.component.css'
})
export class ModalCreatePapComponent {
  imageFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;  
  @Input() area?: Pap;
  @Output() IsrUpdated = new EventEmitter<Pap[]>();

  errorMessages: { [key: string]: string[] } = {};

  constructor(
    private podService: PapService,
    public dialogRef: MatDialogRef<ModalCreatePodComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  save(): void {
    if (this.data) {
      const formData = new FormData();
      
      // Append form fields
      formData.append('pap_name', this.data.podName);
      
      // Check if "others" field is empty or undefined, and append "N/A" if it is
      const othersValue = this.data.others && this.data.others.trim() ? this.data.others : 'N/A';
      formData.append('pap_others', othersValue);   
      formData.append('description', this.data.description);
    
      // Check if an image file is available
      if (this.imageFile) {
        formData.append('file', this.imageFile);
        this.submitFormData(formData);
      } else {
        // Fetch the default image and append it to formData
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
    this.podService.createPaps(formData).subscribe({
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
