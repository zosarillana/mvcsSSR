import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  @Output() onSave = new EventEmitter<User>();  // Emit saved user data
  @Output() userUpdated = new EventEmitter<User[]>();
  isPasswordEnabled = false; // Default is disabled
  passwordValue = '';
  errorMessages: { [key: string]: string[] } = {};

  // Define the FormGroup for the form
  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public dialogRef: MatDialogRef<ModalEditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog // Inject MatDialog service
  ) {
    this.userForm = this.fb.group({
      abfi_id: [
        this.data.abfi_id || '',
        [
          Validators.required,
          Validators.pattern(/^\d{3}-\d{3}$/), // Pattern for 000-000 format
          Validators.maxLength(7), // Maximum length check (7 characters)
        ],
      ],
      role_id: [this.data.role_id || null, Validators.required],
      company: [this.data.company || '', Validators.required],
      department: [this.data.department || '', Validators.required],
      position: [this.data.position || '', Validators.required],
      fname: [this.data.fname || '', Validators.required],
      mname: [this.data.mname || ''],
      lname: [this.data.lname || '', Validators.required],
      email_add: [
        this.data.email_add || '',
        [Validators.required, Validators.email],
      ],
      contact_num: [
        this.data.contact_num || '',
        [Validators.required, Validators.pattern(/^\d{11}$/)], // 11-digit phone number
      ],
      username: [
        this.data.username || '',
        [Validators.required, Validators.maxLength(100)],
      ],
      user_password: [this.data.user_password || ''],
    });
  }

  // Handles closing the modal dialog without saving
  onNoClick(): void {
    this.dialogRef.close();
  }

  // Confirmation dialog before saving
  openConfirmationDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.save(); // Proceed with saving if the user confirmed
      }
    });
  }
 
  save(): void {
    // Grab the updated values from the form
    const formValues = this.userForm.value;
  
    // If password is enabled and changed, use the updated password value
    formValues.user_password = this.passwordValue || formValues.user_password;
   
    // Ensure user_id is present and create updatedUser object
    const updatedUser: User = { id: this.data.user_id, ...formValues };
  
    if (!updatedUser.id) {
      console.error('User ID is missing, cannot update.');
      return;
    }
  
    // Call the updateUser method from the UserService
    this.userService.updateUser(updatedUser).subscribe({
      next: (response) => {
        // Emit the updated user data when saving is successful
        this.onSave.emit(updatedUser);  // Emit event with the updated user
        this.dialogRef.close(updatedUser);  // Close with the updated user data
      },
      error: (errorResponse) => {
        this.handleErrorResponse(errorResponse);
      },
    });
  }
  

  // Method to handle password input changes
  onPasswordInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.passwordValue = input.value; // Update the password value based on user input
  }

  // Method to toggle password field enabled state
  togglePasswordField(event: any): void {
    this.isPasswordEnabled = event.target.checked;

    // Update the password field validation based on the toggle
    const passwordControl = this.userForm.get('user_password');

    if (this.isPasswordEnabled) {
      // Add validators if password is enabled
      passwordControl?.setValidators([
        Validators.required,
        Validators.pattern(
          /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        ),
      ]);
    } else {
      // Remove validators if password is disabled
      passwordControl?.clearValidators();
    }

    // Update the form control status
    passwordControl?.updateValueAndValidity();
  }

  // Fetch users for updating and emit the event when the user list changes
  fetchMarketVisits(): void {
    this.userService.getUsers().subscribe((users: User[]) => {
      this.userUpdated.emit(users);
    });
  }

  // Method to mark all fields as touched (for showing validation errors)
  markAllFieldsAsTouched(): void {
    Object.keys(this.userForm.controls).forEach((field) => {
      const control = this.userForm.get(field);
      control?.markAsTouched();
    });
  }

  // Method to handle error responses from the server
  handleErrorResponse(errorResponse: any): void {
    this.errorMessages = {}; // Clear previous error messages

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
  }

  validateFields(): boolean {
    if (this.userForm.invalid) {
      this.markAllFieldsAsTouched();
      return false;
    }
    return true;
  }
}
