import { Component, EventEmitter, Inject, Input, Output, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '../../../../../../../models/user';
import { UserService } from '../../../../../../../services/user.service';
import { ModalEditUserDialogComponent } from '../modal-edit-user-dialog/modal-edit-user-dialog.component';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-modal-view-user-dialog',
  templateUrl: './modal-view-user-dialog.component.html',
  styleUrls: ['./modal-view-user-dialog.component.css'], // Fixed `styleUrls`
})
export class ModalViewUserDialogComponent implements OnInit {  // Implement `OnInit`
  @Input() user?: User;
  @Output() userUpdated = new EventEmitter<User[]>();

  formattedDate: string = '';
  formattedDateUpdated: string = '';
  errorMessages: { [key: string]: string[] } = {};

  constructor(
    private userService: UserService,
    public dialogRef: MatDialogRef<ModalEditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit(): void {
    // Format dates if they are defined, fallback to empty strings otherwise
    this.formattedDate = this.data.date_created ? formatDate(this.data.date_created, 'short', 'en-US') : '';
    this.formattedDateUpdated = this.data.date_updated ? formatDate(this.data.date_updated, 'short', 'en-US') : '';
  }

  // Close dialog
  onNoClick(): void {
    this.dialogRef.close();
  }
  // Fetch users and emit event after updating
  private fetchUsers(): void {  // renamed to a more accurate name
    this.userService.getUsers().subscribe((users: User[]) => {
      this.userUpdated.emit(users);
    });
  }
}
