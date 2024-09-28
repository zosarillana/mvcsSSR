import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { MarketVisits } from '../../models/market-visits';
import { MarketVisitsService } from '../../services/market-visits.service';
import { TokenService } from '../../services/token.service';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SseService } from '../../services/sse.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { AuthService } from '../../auth/auth.service';
import { AreaService } from '../../services/area.service';
import { IsrService } from '../../services/isr.service';
import { PodService } from '../../services/pod.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  @Input() mvisit?: MarketVisits;
  role_id: string | null = null;
  user_id: string | null = null; // Declare user_id here
  users: User[] = [];
  userCount: number = 0;
  areaCount: number = 0;
  isrCount: number = 0;
  podCount: number = 0;
  visitCount: number = 0;
  visitCountUser: number = 0;
  chartData: any[] = []; // Using any[]
  previousMarketVisits: MarketVisits[] = []; 
  public dateCreated: string[] = []; // Declare the dateCreated property
  public marketVisits: MarketVisits[] = []; // Already initialized as empty
  private _chartName: string = 'Default Chart Name';
  private subscription: Subscription = new Subscription();
  public getChartTitle(): string {
    return this._chartName;
  }
  constructor(
    private marketVisitsService: MarketVisitsService,
    private cdr: ChangeDetectorRef,
    private tokenService: TokenService,
    private matSnackBar: MatSnackBar,
    private sseService: SseService,
    private userService: UserService,
    private areaService: AreaService,
    private isrService: IsrService,
    private podService: PodService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.tokenService.decodeTokenAndSetUser();
    const user = this.tokenService.getUser();
    this.role_id = user?.role_id ?? null;
    this.user_id = user?.id ?? null; // Now this is valid
    this.cdr.detectChanges();
    this.subscribeToSseMessages();
    this.loadDashboardData();
  }
  loadDashboardData(): void {
    this.fetchAllCount();
    this.updateVisitCount();
    this.updateVisitCountUser();
    this.getMarketVisitsDataAll();
  }
  // Subscribe to SSE messages instead of WebSocket
  private previousVisitCount: number | null = null;
  private previousVisitCountUser: number | null = null;
  private subscribeToSseMessages(): void {
    this.subscription.add(
      this.sseService.messages$.subscribe((event) => {
        const message = event.data; // Extract the message from the event
        console.log('Received SSE message:', message);

        // Display the message using MatSnackBar
        this.matSnackBar.open(message, 'Close', {
          duration: 3000, // Duration in milliseconds
        });

        // Fetch the latest data and update the options
        this.userService.getUsers().subscribe(
          (result: User[]) => {
            this.users = result || []; // Update the local data
            this.fetchAllCount();
            this.updateVisitCount();
            this.updateVisitCountUser();
            this.getMarketVisitsDataAll();
          },
          (error) => {
            console.error('Error fetching market visits on SSE update:', error);
          }
        );
      })
    );
  }
  private updateVisitCount(): void {
    if (this.authService.isLoggedIn()) {
      this.marketVisitsService.getVisitCount().subscribe(
        (count: number) => {
          if (count !== this.previousVisitCount) {
            this.previousVisitCount = count;
            this.visitCount = count;
          }
        },
        (error) => {
          console.error('Error fetching visit count:', error);
        }
      );
    }
  }
  private updateVisitCountUser(): void {
    if (this.authService.isLoggedIn()) {
      this.marketVisitsService.getVisitCountUser().subscribe(
        (count: number) => {
          if (count !== this.previousVisitCountUser) {
            this.previousVisitCountUser = count;
            this.visitCountUser = count;
          }
        },
        (error) => {
          console.error('Error fetching visit count:', error);
        }
      );
    }
  }
  
  private getMarketVisitsDataAll(): void {
    if (this.authService.isLoggedIn()) {
        this.marketVisitsService.getMarketVisits().subscribe(
            (data: MarketVisits[]) => { 
                console.log('Fetched market visits:', data); // Debugging line
                if (data.length !== this.previousMarketVisits.length) {
                    this.previousMarketVisits = data;
                    this.marketVisits = data; // Store the fetched data
                    
                    // Extract date_created into the dateCreated array
                    this.dateCreated = data.map(visit => visit.date_created); // Assuming date_created exists in MarketVisits
                }
            },
            (error) => {
                console.error('Error fetching market visits:', error);
            }
        );
    }
}

// Example method to process the data for the chart
private processMarketVisitsForChart(data: MarketVisits[]): void {
    // Create an array of date and count pairs
    const chartData = data.map(visit => ({
        date: visit.date_created,
        count: this.marketVisits.length // Replace with actual count property from your MarketVisits model
    }));

    // Now you can pass `chartData` to your chart component
    this.chartData = chartData; // Ensure you have a property to hold this data
}


  
  private fetchAllCount(): void {
    if (this.authService.isLoggedIn()) {
      this.userService.getUserCount().subscribe(
        (userCount: number) => {
          this.userCount = userCount;

          this.isrService.getIsrCount().subscribe(
            (isrCount: number) => {
              this.isrCount = isrCount;

              this.areaService.getAreaCount().subscribe(
                (areaCount: number) => {
                  this.areaCount = areaCount;

                  this.podService.getPodsCount().subscribe(
                    (podCount: number) => {
                      this.podCount = podCount;
                    },
                    (error) => {
                      console.error('Error fetching area count:', error); // Error handling for area count
                    }
                  );
                },
                (error) => {
                  console.error('Error fetching ISR count:', error); // Error handling for ISR count
                }
              );
            },
            (error) => {
              console.error('Error fetching user count:', error); // Error handling for user count
            }
          );
        },
        (error) => {
          console.error('Error fetching user count:', error); // Error handling for user count
        }
      );
    }
  }
}
