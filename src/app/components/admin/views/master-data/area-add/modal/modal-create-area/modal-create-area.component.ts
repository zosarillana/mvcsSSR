import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Area } from '../../../../../../../models/area';
import { AreaService } from '../../../../../../../services/area.service';

@Component({
  selector: 'app-modal-create-area',
  templateUrl: './modal-create-area.component.html',
  styleUrl: './modal-create-area.component.css'
})
export class ModalCreateAreaComponent {
  @Input() area?: Area;
  @Output() areaUpdated = new EventEmitter<Area[]>();

  // Object to hold field-specific error messages
  errorMessages: { [key: string]: string[] } = {};

  constructor(
    private areaService: AreaService,
    public dialogRef: MatDialogRef<ModalCreateAreaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.areaService.createAreas(this.data).subscribe({
      next: (response) => {
        this.dialogRef.close(this.data);
      },
      error: (errorResponse) => {
        // Log the error response for debugging
        // console.log('Error Response:', errorResponse);

        // Clear previous error messages
        this.errorMessages = {};

        if (errorResponse && typeof errorResponse === 'object') {
          if (errorResponse.errors) {
            // Handle validation errors
            for (const [key, value] of Object.entries(errorResponse.errors)) {
              if (Array.isArray(value)) {
                this.errorMessages[key] = value; // Map field to its errors
              } else if (typeof value === 'string') {
                this.errorMessages[key] = [value]; // Single error message as an array
              } else {
                this.errorMessages[key] = ['Unexpected error format.'];
              }
            }
          } else if (errorResponse.message) {
            this.errorMessages['general'] = [errorResponse.message]; // General error message
          } else {
            this.errorMessages['general'] = ['Unexpected error format.'];
          }
        } else {
          this.errorMessages['general'] = ['An unknown error occurred.'];
        }
      }
    });
  }
}
