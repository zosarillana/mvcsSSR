import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { User } from '../../../../../../../models/user';
import { UserService } from '../../../../../../../services/user.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-delete-user-dialog',
  templateUrl: './modal-delete-user-dialog.component.html',
  styleUrls: ['./modal-delete-user-dialog.component.css']
})
export class ModalDeleteUserDialogComponent {
  @Input() user?: User;
  @Output() userUpdated = new EventEmitter<User[]>();

  constructor(
    private userService: UserService,
    public dialogRef: MatDialogRef<ModalDeleteUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any // Ensure this contains user ID
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  deleteUser(): void {
    const userId = this.data.user_id; // Assuming data contains user_id
    if (!userId) {
      console.error('User ID is missing, cannot delete.');
      return;
    }

    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.fetchUsers(); // Fetch updated users after deletion
        this.dialogRef.close(); // Close the dialog
      },
      error: (errorResponse) => {
        // console.log('Error Response:', errorResponse);
        // Handle error response if necessary
      },
    });
  }

  private fetchUsers(): void {
    this.userService.getUsers().subscribe((users: User[]) => {
      this.userUpdated.emit(users); // Emit the updated user list
    });
  }
}
