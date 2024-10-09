import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '../../../../../../../models/user';
import { UserService } from '../../../../../../../services/user.service';

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

  constructor(
    private userService: UserService,
    public dialogRef: MatDialogRef<ModalCreateUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  validateFields(): boolean {
    this.errorMessages = {};

    // Validate abfi_id (Employee ID)
    if (!this.data.abfi_id || this.data.abfi_id.trim() === '') {
      this.errorMessages['abfi_id'] = ['Employee ID is required.'];
    }

    // Validate role_id (Role)
    if (!this.data.role_id) {
      this.errorMessages['role'] = ['Role is required.'];
    }
    // Validate role_id (Role)
    if (!this.data.role_id) {
      this.errorMessages['company'] = ['Company is required.'];
    }
    // Validate role_id (Role)
    if (!this.data.role_id) {
      this.errorMessages['department'] = ['Department is required.'];
    }
    // Validate role_id (Role)
    if (!this.data.role_id) {
      this.errorMessages['position'] = ['Position is required.'];
    }

    // Validate first name
    if (!this.data.fname || this.data.fname.trim() === '') {
      this.errorMessages['fname'] = ['First name is required.'];
    }

    // Validate last name
    if (!this.data.lname || this.data.lname.trim() === '') {
      this.errorMessages['lname'] = ['Last name is required.'];
    }

    // Validate email address
    const emailPattern = /^[a-zA-Z0-9._%+-]+@abfiph\.com$/;
    if (!this.data.email_add || !emailPattern.test(this.data.email_add)) {
      this.errorMessages['email_add'] = ['Email address must be a valid address with domain "@abfiph.com".'];
    }

    // Validate contact number (11 digits)
    const contactNumPattern = /^\d{11}$/;
    if (!this.data.contact_num || !contactNumPattern.test(this.data.contact_num)) {
      this.errorMessages['contact_num'] = ['Contact number should be 11 digits long.'];
    }

    // Validate username (minimum 8 characters)
    if (!this.data.username || this.data.username.length < 8) {
      this.errorMessages['username'] = ['Username should be at least 8 characters long.'];
    }

    // Validate password
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!this.data.user_password || !passwordPattern.test(this.data.user_password)) {
      this.errorMessages['user_password'] = [
        'Password must be at least 8 characters long, contain at least one uppercase letter, one special character, and one numeric digit.',
      ];
    }

    // Return false if there are validation errors
    return Object.keys(this.errorMessages).length === 0;
  }

  save(): void {
    if (this.validateFields()) {
      // Convert role_id to number if it is a string
      if (typeof this.data.role === 'string') {
        this.data.role = parseInt(this.data.role, 10);
      }

      this.userService.createUser(this.data).subscribe({
        next: (response) => {
          console.log(this.data);
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
        },
      });
    }
  }
}
