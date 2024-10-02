import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../../../../../services/user.service';
import { User } from '../../../../../../../models/user';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-modal-edit-user-dialog',
  templateUrl: './modal-edit-user-dialog.component.html',
  styleUrls: ['./modal-edit-user-dialog.component.css'],
})
export class ModalEditUserDialogComponent {
  @Input() user?: User;
  @Output() userUpdated = new EventEmitter<User[]>();
  isPasswordEnabled = false; // Default is disabled
  passwordValue = ''; 
  errorMessages: { [key: string]: string[] } = {};

  constructor(
    private userService: UserService,
    public dialogRef: MatDialogRef<ModalEditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog // Inject MatDialog service
  ) {}

  // Handles closing the modal dialog without saving
  onNoClick(): void {
    this.dialogRef.close();
  }

  // Confirmation dialog before saving
  openConfirmationDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.save(); // Proceed with saving if the user confirmed
      }
    });
  }

  // Save method to update user data
  save(): void {
    // console.log('User Data:', this.data);  // Check the user data

    // Include password in the data object, or set it to an empty string if passwordValue is empty
    this.data.user_password = this.passwordValue || '';
    
    // Ensure the user_id exists and create an updatedUser object
    const updatedUser: User = { id: this.data.user_id, ...this.data };

    if (!updatedUser.id) {
      console.error('User ID is missing, cannot update.');
      return;
    }

    // Call the updateUser method from the UserService
    this.userService.updateUser(updatedUser).subscribe({
      next: (response) => {
        // console.log('User updated successfully', response);
        this.dialogRef.close(this.data);
      },
      error: (errorResponse) => {
        // console.log('Error Response:', errorResponse);

        // Clear previous error messages
        this.errorMessages = {};

        if (errorResponse && typeof errorResponse === 'object') {
          if (errorResponse.errors) {
            for (const [key, value] of Object.entries(errorResponse.errors)) {
              this.errorMessages[key] = Array.isArray(value) ? value : [value];
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
  }

  // Method to handle password input changes
  onPasswordInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.passwordValue = input.value;  // Update the password value based on user input
  }

  // Method to toggle password field enabled state
  togglePasswordField(event: any): void {
    this.isPasswordEnabled = event.target.checked;
  }

  // Fetch users for updating and emit the event when the user list changes
  fetchMarketVisits(): void {
    this.userService.getUsers().subscribe((users: User[]) => {
      this.userUpdated.emit(users);
    });
  }
}
