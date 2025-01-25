import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '../../../../../../../models/user';
import { UserService } from '../../../../../../../services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-modal-create-user-dialog',
  templateUrl: './modal-create-user-dialog.component.html',
  styleUrls: ['./modal-create-user-dialog.component.css'],
})
export class ModalCreateUserDialogComponent {
  @Input() user?: User;
  @Output() userUpdated = new EventEmitter<User[]>();
 
  // Object to hold field-specific error messages
  errorMessages: { [key: string]: string[] } = {};
  userForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public dialogRef: MatDialogRef<ModalCreateUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.userForm = this.fb.group({
      abfi_id: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{3}-\d{3}$/), // Pattern for 000-000 format
          Validators.maxLength(7)  // Maximum length check (7 characters)
        ]
      ],
      role_id: [null, Validators.required], // Role
      company: ['', Validators.required], // Company
      department: ['', Validators.required], // Department
      position: ['', Validators.required], // Position
      fname: ['', Validators.required], // First Name
      mname: [''], // Middle Name
      lname: ['', Validators.required], // Last Name
      email_add: [
        '',
        [Validators.required, Validators.email], // Valid email
      ],
      contact_num: [
        '',
        [Validators.required, Validators.pattern(/^\d{11}$/)], // 11-digit phone number
      ],
      username: [
        '',
        [Validators.required, Validators.maxLength(100)], // Max 100 characters
      ],
      user_password: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
          ), // Password pattern
        ],
      ],
    });
  }

  validateFields(): boolean {
    if (this.userForm.invalid) {
      this.markAllFieldsAsTouched();
      return false;
    }
    return true;
  }

  markAllFieldsAsTouched() {
    Object.keys(this.userForm.controls).forEach((field) => {
      const control = this.userForm.get(field);
      control?.markAsTouched();
    });
  }

  getErrorMessages() {
    const errorMessages: Record<string, string[]> = {};
    Object.keys(this.userForm.controls).forEach((field) => {
      const control = this.userForm.get(field);
      if (control && control.errors) {
        errorMessages[field] = Object.keys(control.errors).map((errorKey) => {
          switch (errorKey) {
            case 'required':
              return `${field} is required.`;
            case 'email':
              return 'Email address must be a valid address.';
            case 'pattern':
              if (field === 'contact_num') {
                return 'Contact number should be 11 digits long.';
              }
              if (field === 'user_password') {
                return 'Password must be at least 8 characters long, contain at least one uppercase letter, one special character, and one numeric digit.';
              }
              break;
            case 'maxlength':
              return 'Username should be 100 characters long or less.';
          }
          return '';
        });
      }
    });
    return errorMessages;
  }
  
  onNoClick(): void {
    this.dialogRef.close();
  }

  save(): void {
    // Validate the form using the userForm's validity
    if (this.userForm.valid) {
      // Use the form's values instead of this.data
      const userData = this.userForm.value;
  
      this.userService.createUser(userData).subscribe({
        next: (response) => {
          console.log('Response:', response);
          this.dialogRef.close(userData); // Pass the form data back when closing
        },
        error: (errorResponse) => {
          // Log the error response for debugging
          console.log('Error Response:', errorResponse);
          console.log('Error Response Content:', errorResponse.error);
  
          // Reset error messages
          this.errorMessages = {};
  
          // Populate error messages if the server responds with validation errors
          if (errorResponse.error && errorResponse.error.errors) {
            this.errorMessages = errorResponse.error.errors;
          } else {
            // Provide a general error message if specific errors are not present
            this.errorMessages['general'] = ['An unexpected error occurred.'];
          }
  
          // Log populated error messages
          console.log('Populated Error Messages:', this.errorMessages);
  
          // Optionally display a toast or alert for general errors
          if (this.errorMessages['general']) {
            this.displayGeneralErrorMessage();
          }
        },
      });
    } else {
      // If the form is invalid, mark all fields as touched to display validation errors
      this.markAllFieldsAsTouched();
    }
  }
  

  // Define the displayGeneralErrorMessage method
  displayGeneralErrorMessage(): void {
    // For example, log the general error message or show a toast notification
    if (this.errorMessages['general']) {
      console.log('General error:', this.errorMessages['general']);
      // Optionally, show a toast notification here using a library like ngx-toastr
    }
  }
}
