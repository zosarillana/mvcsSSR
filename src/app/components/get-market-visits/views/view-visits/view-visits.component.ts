import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MarketVisits } from '../../../../models/market-visits';
import { MarketVisitsService } from '../../../../services/market-visits.service';
import { DatePipe } from '@angular/common';
import { environment } from '../../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-visits',
  templateUrl: './view-visits.component.html',
  styleUrl: './view-visits.component.css',
})
export class ViewVisitsComponent {
  @Input() visitId: string | null = null;
  @Input() mvisit?: MarketVisits;
  @Output() marketVisitsUpdated = new EventEmitter<MarketVisits[]>();

  constructor(
    private route: ActivatedRoute,
    private marketVisitsService: MarketVisitsService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.visitId = params.get('id');
      if (this.visitId) {
        // Logic to handle the ID, e.g., load data based on the ID
        console.log('Visit ID:', this.visitId);
      }
    });
    console.log('Visit ID:', this.visitId); // Debugging
    if (this.visitId) {
      this.marketVisitsService.getVisitById(this.visitId).subscribe(
        (visit: MarketVisits) => {
          this.mvisit = visit;
          console.log('Visit data:', this.mvisit); // Debugging
        },
        (error) => {
          console.error('Error fetching visit:', error); // Log any errors
        }
      );
    }
  }
  // Method to get all area names as a single string
  getAllAreaNames(): string {
    return (
      this.mvisit?.areas.map((area) => area.area_name).join(', ') || 'No Areas'
    );
  }

  getAllAccountType(): string {
    return (
      this.mvisit?.accountTypes.map((accountTypes) => accountTypes.accountType_name).join(', ') || 'No Account Types'
    );
  }
  getAllPaps(): string {
    return (
      this.mvisit?.paps.map((paps) => paps.pap_name).join(', ') || 'No Paps'
    );
  }

  getAllIsrs(type: 'NEEDS' | 'REQUIREMENTS'): string {
    return (
      this.mvisit?.isrs
        .filter((isr) => isr.isr_type === type)
        .map((isr) => isr.isr_name)
        .join(', ') || 'No In store requirement'
    );
  }
  
  getAllPods(type: 'CANNED' | 'MPP'): string {
    return (
      this.mvisit?.pods
        .filter((pod) => pod.pod_type === type)
        .map((pod) => pod.pod_name)
        .join(', ') || 'No Poduct on Display'
    );
  }
  private url = '/api/api/MarketVisits';
  public imageUrlBase = `${this.url}/image/`;
  
  getImageUrl(imageName: string | undefined): string {
    return imageName ? `${this.imageUrlBase}${imageName}` : 'assets/images/placeholder.png'; // Fallback to a placeholder image
  }
  

  getFormattedVisitDate(): string {
    if (this.mvisit && this.mvisit.visit_date) {
      const date = new Date(this.mvisit.visit_date);
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit'
      };
      return date.toLocaleDateString('en-US', options).replace(',', '');
    }
    return 'No Date';
  }
  
  onSubmit(): void {
    // if (this.mvisit && this.visitId) {
    //   this.marketVisitsService.updateMarketVisits(this.visitId, this.mvisit).subscribe(
    //     (updatedVisit: MarketVisits) => {
    //       this.marketVisitsUpdated.emit([updatedVisit]);
    //     },
    //     (error) => {
    //       console.error('Error updating visit:', error);
    //     }
    //   );
    // }
  }
}
