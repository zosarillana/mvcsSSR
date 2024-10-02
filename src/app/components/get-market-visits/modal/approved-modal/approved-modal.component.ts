import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MarketVisitsService } from '../../../../services/market-visits.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MarketVisits } from '../../../../models/market-visits';

@Component({
  selector: 'app-approved-modal',
  templateUrl: './approved-modal.component.html',
  styleUrl: './approved-modal.component.css'
})
export class ApprovedModalComponent {
  @Input() mvisit?: MarketVisits;
  @Output() marketVisitsUpdated = new EventEmitter<MarketVisits[]>();

  constructor(
    private marketVisitsService: MarketVisitsService,
    public dialogRef: MatDialogRef<ApprovedModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any // Ensure data has the necessary market visit ID
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  approveVisit(): void {
    // Ensure you're using the correct market visit ID from the data
    const visitId = this.data.id; // Replace with the actual ID field if different

    this.marketVisitsService.updateMarketVisitStatusApproved(visitId).subscribe({
      next: () => {
        this.updateVisit(); // Fetch the updated list after updating the status
        this.dialogRef.close(); // Close the dialog after fetching users
      },
      error: (error) => {
        console.error('Error updating market visit status:', error);
      }
    });
  }

  // Fetch users after deletion to update the list
  private updateVisit() {
    this.marketVisitsService.getMarketVisits().subscribe((marketVisits: MarketVisits[]) => {
      this.marketVisitsUpdated.emit(marketVisits); // Emit the updated user list
    });
  }
}