import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../../../../../../services/user.service';
import { User } from '../../../../../../models/user';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-modal-changepass',
  templateUrl: './modal-changepass.component.html',
  styleUrls: ['./modal-changepass.component.css'],
})
export class ModalChangepassComponent implements OnInit {
  passwordForm: FormGroup;
  currentUser: User | undefined;
  statusMessage: string = '';

  // Flag to toggle password visibility
  public oldPasswordVisible: boolean = false;
  public newPasswordVisible: boolean = false;
  public confimPasswordVisible: boolean = false;

  // Method to toggle password visibility
  toggleOldPasswordVisibility() {
    this.oldPasswordVisible = !this.oldPasswordVisible;
  }
  toggleNewPasswordVisibility() {
    this.newPasswordVisible = !this.newPasswordVisible;
  }
  toggleConfirmPasswordVisibility() {
    this.confimPasswordVisible = !this.confimPasswordVisible;
  }

  constructor(
    private matSnackBar: MatSnackBar,
    private fb: FormBuilder,
    private userService: UserService,
    public dialogRef: MatDialogRef<ModalChangepassComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userId: number }
  ) {
    this.passwordForm = this.fb.group({
      old_password: ['', Validators.required],
      new_password: ['', [Validators.required, this.passwordValidator]],
      confirm_password: [
        '',
        [Validators.required, this.confirmPasswordValidator.bind(this)],
      ],
    });
  }

  ngOnInit(): void {
    this.userService.getUsersSearch(this.data.userId).subscribe(
      (users) => {
        if (users && users.length > 0) {
          this.currentUser = users[0];
        } else {
          console.error('User not found');
          this.statusMessage = 'User not found';
        }
      },
      (error) => {
        console.error('Error fetching user:', error);
        this.statusMessage = 'Error fetching user. Please try again.';
      }
    );
  }

  //   onSubmit(): void {
  //     console.log('Current User:', this.currentUser);
  //     if (this.passwordForm.valid && this.currentUser) {
  //         const { old_password, new_password, confirm_password } = this.passwordForm.value;

  //         const changePasswordDto = {
  //             oldPassword: old_password,
  //             newPassword: new_password,
  //             confirmPassword: confirm_password
  //         };

  //         // Clear any previous status messages
  //         this.statusMessage = 'Updating password...';

  //         const userId = this.currentUser.user_id;

  //         console.log('User ID being used for password update:', userId);

  //         if (userId !== undefined) {
  //             this.userService.changePassword(userId, changePasswordDto).subscribe(
  //                 response => {
  //                     console.log('Password updated successfully:', response);
  //                     this.statusMessage = 'Password updated successfully!';
  //                     // Reset form fields
  //                     this.passwordForm.reset();
  //                     // Optionally close the dialog after a timeout
  //                     setTimeout(() => {
  //                         this.dialogRef.close();
  //                     }, 1500);
  //                 },
  //                 error => {
  //                     console.error('Error updating password:', error);
  //                     this.statusMessage = `Error updating password for user ID: ${userId}. Please check your input and try again.`;
  //                 }
  //             );
  //         } else {
  //             console.error('Current user ID is undefined.', this.currentUser);
  //             this.statusMessage = 'Error: Current user ID is not available.';
  //         }
  //     } else {
  //         console.error('Form is invalid or currentUser is undefined.');
  //         this.statusMessage = 'Please fill in all fields correctly.';
  //     }
  // }

  onSubmit(): void {
    console.log('Current User:', this.currentUser);
    if (this.passwordForm.valid && this.currentUser) {
      const { old_password, new_password, confirm_password } =
        this.passwordForm.value;

      const changePasswordDto = {
        oldPassword: old_password,
        newPassword: new_password,
        confirmPassword: confirm_password,
      };

      this.statusMessage = 'Updating password...';

      const userId = this.currentUser.user_id;

      console.log('User ID being used for password update:', userId);

      if (userId !== undefined) {
        this.userService.changePassword(userId, changePasswordDto).subscribe({
          next: (response) => {
            // console.log('Password updated successfully:', response);
            this.statusMessage =
              response.message || 'Password updated successfully!'; // Use response message if available

            // Show success message using MatSnackBar
            this.matSnackBar.open(this.statusMessage, 'Close', {
              duration: 3000, // Duration in milliseconds
            });

            this.passwordForm.reset();
            setTimeout(() => {
              this.dialogRef.close();
            }, 1500);
          },
          error: (error) => {
            console.error('Error updating password:', error);
            this.statusMessage =
              error.error?.message || 'Old password is incorrect.'; // Show error message from the service

            // Show error message using MatSnackBar
            this.matSnackBar.open(this.statusMessage, 'Close', {
              duration: 3000, // Duration in milliseconds
            });
          },
        });
      } else {
        console.error('Current user ID is undefined.', this.currentUser);
        this.statusMessage = 'Error: Current user ID is not available.';
      }
    } else {
      console.error('Form is invalid or currentUser is undefined.');
      this.statusMessage = 'Please fill in all fields correctly.';
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  passwordValidator(control: FormControl): { [key: string]: boolean } | null {
    const password = control.value;
    const isValid =
      password &&
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*]/.test(password);
    return isValid ? null : { invalidPassword: true };
  }

  confirmPasswordValidator(
    control: FormControl
  ): { [key: string]: boolean } | null {
    const newPassword = this.passwordForm?.get('new_password')?.value;
    return control.value === newPassword ? null : { passwordsDoNotMatch: true };
  }
}
