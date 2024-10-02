import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MarketVisits } from '../../../../models/market-visits';
import { MarketVisitsService } from '../../../../services/market-visits.service';

@Component({
  selector: 'app-recall-modal',
  templateUrl: './recall-modal.component.html',
  styleUrl: './recall-modal.component.css'
})
export class RecallModalComponent {
  @Input() mvisit?: MarketVisits;
  @Output() marketVisitsUpdated = new EventEmitter<MarketVisits[]>();

  constructor(
    private marketVisitsService: MarketVisitsService,
    public dialogRef: MatDialogRef<RecallModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any // Ensure data has the necessary market visit ID
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  recallVisit(): void {
    // Ensure you're using the correct market visit ID from the data
    const visitId = this.data.id; // Replace with the actual ID field if different

    this.marketVisitsService.updateMarketVisitStatusRecalled(visitId).subscribe({
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