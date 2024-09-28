import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { Area } from '../../../../../../../models/area';
import { AreaService } from '../../../../../../../services/area.service';
import { ConfirmDialogComponent } from '../../../../user/user-add/modal/modal-edit-user-dialog/confirm-dialog/confirm-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ModalEditUserDialogComponent } from '../../../../user/user-add/modal/modal-edit-user-dialog/modal-edit-user-dialog.component';

@Component({
  selector: 'app-modal-edit-area',
  templateUrl: './modal-edit-area.component.html',
  styleUrl: './modal-edit-area.component.css'
})
export class ModalEditAreaComponent {
  @Input() area?: Area;
  @Output() areaUpdated = new EventEmitter<Area[]>();

  errorMessages: { [key: string]: string[] } = {};

  constructor(
    private areaService: AreaService,
    public dialogRef: MatDialogRef<ModalEditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog // Inject MatDialog service
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  openConfirmationDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.save(); // Proceed with saving if the user confirmed
      }
    });
  }

  save(): void {
    console.log(this.data);
    this.areaService.updateAreas(this.data).subscribe({
      next: (response) => {
        this.dialogRef.close(this.data);
      },
      error: (errorResponse) => {
        // Log the error response for debugging
        console.log('Error Response:', errorResponse);

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
      },
    });
  }
}
