import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ModalDeleteAreaComponent } from '../../../area-add/modal/modal-delete-area/modal-delete-area.component';
import { Pap } from '../../../../../../../models/pap';
import { PapService } from '../../../../../../../services/pap.service';

@Component({
  selector: 'app-modal-delete-pap',
  templateUrl: './modal-delete-pap.component.html',
  styleUrl: './modal-delete-pap.component.css'
})
export class ModalDeletePapComponent {
  @Input() pod?: Pap;
  @Output() podUpdated = new EventEmitter<Pap[]>();

  constructor(
    private podService: PapService,
    public dialogRef: MatDialogRef<ModalDeleteAreaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  deleteArea(): void {
    this.podService.deletePaps(this.data).subscribe(() => {
      this.fetchUsers();
      this.dialogRef.close(this.data); // Close the dialog after fetching users
    });
  }

  // Fetch users after deletion to update the list
  private fetchUsers() {
    this.podService.getPaps().subscribe((pods: Pap[]) => {
      this.podUpdated.emit(pods); // Emit the updated user list
    });
  }
}
