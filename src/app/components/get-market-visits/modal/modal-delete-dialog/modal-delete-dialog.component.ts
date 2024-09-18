import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MarketVisits } from '../../../../models/market-visits';
import { MarketVisitsService } from '../../../../services/market-visits.service';

@Component({
  selector: 'app-modal-delete-dialog',
  templateUrl: './modal-delete-dialog.component.html',
  styleUrl: './modal-delete-dialog.component.css',
})
export class ModalDeleteDialogComponent {
  @Input() mvisit?: MarketVisits;
  @Output() marketVisitsUpdated = new EventEmitter<MarketVisits[]>();

  constructor(
    private marketVisitsService: MarketVisitsService,
    public dialogRef: MatDialogRef<ModalDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

 onNoClick(): void {
    this.dialogRef.close();
  }

  deleteVisit(): void {
    this.marketVisitsService.deleteMarketVisits(this.data).subscribe(() => {
      this.updateVisit();
      this.dialogRef.close(this.data); // Close the dialog after fetching users
    });
  }

  // Fetch users after deletion to update the list
  private updateVisit() {
    this.marketVisitsService.getMarketVisits().subscribe((marketVisits: MarketVisits[]) => {
      this.marketVisitsUpdated.emit(marketVisits); // Emit the updated user list
    });
  }
}
