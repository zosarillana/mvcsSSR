import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { MarketVisits } from '../../models/market-visits';
import { MarketVisitsService } from '../../services/market-visits.service';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  @Input() mvisit?: MarketVisits;
  role_id: string | null = null;
  user_id: string | null = null; // Declare user_id here

  constructor(private marketVisitsService: MarketVisitsService,
    private cdr: ChangeDetectorRef,
    private tokenService: TokenService,
  ) {}

  ngOnInit(): void {
    this.tokenService.decodeTokenAndSetUser();
    const user = this.tokenService.getUser();
    this.role_id = user?.role_id ?? null;
    this.user_id = user?.id ?? null; // Now this is valid
    this.cdr.detectChanges();
  }
}
