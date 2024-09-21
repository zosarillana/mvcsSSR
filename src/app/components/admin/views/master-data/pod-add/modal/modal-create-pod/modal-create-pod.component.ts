import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Isr } from '../../../../../../../models/isr';
import { PodService } from '../../../../../../../services/pod.service';


@Component({
  selector: 'app-modal-create-pod',
  templateUrl: './modal-create-pod.component.html',
  styleUrl: './modal-create-pod.component.css'
})
export class ModalCreatePodComponent {
  imageFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;  
  @Input() area?: Isr;
  @Output() IsrUpdated = new EventEmitter<Isr[]>();

  errorMessages: { [key: string]: string[] } = {};

  constructor(
    private podService: PodService,
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
      formData.append('pod_name', this.data.podName);

      const othersValue = this.data.others && this.data.others.trim() ? this.data.others : 'N/A';
      formData.append('pod_others', othersValue);
      formData.append('pod_type', this.data.type);
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
            formData.append('file', blob, 'default_img.png');
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
    this.podService.createPods(formData).subscribe({
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
