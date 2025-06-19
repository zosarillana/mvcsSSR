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
  statusData: number[] = [];

  visitCount: number = 0;
  visitCountUser: number = 0;
  // chartData: { year: number; month: number; count: number }[] = [];
  chartData: { year: number; month: number; count: number }[] = [];
  chartDataUser: { year: number; month: number; count: number }[] = [];
  selectedYear: number = new Date().getFullYear(); // default to current year
  yearOptions: number[] = []; // to populate year dropdown
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
  
  // Load market visits data (this will also populate charts)
  this.getMarketVisitsDataAll();
  }
  // Subscribe to SSE messages instead of WebSocket
  private previousVisitCount: number | null = null;
  private previousVisitCountUser: number | null = null;
  private subscribeToSseMessages(): void {
    this.subscription.add(
      this.sseService.messages$.subscribe((event) => {
        const message = event.data; // Extract the message from the event
        // console.log('Received SSE message:', message);

        // Display the message using MatSnackBar
        this.matSnackBar.open(message, 'Close', {
          duration: 3000, // Duration in milliseconds
        });

        // Fetch the latest data and update the options
        this.userService.getUsers().subscribe(
          (result: User[]) => {
            this.users = result || []; // Update the local data
            this.fetchChartData();
            this.fetchChartDataUser();
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
  //   private updateVisitCountUser(): void {
  //     if (this.authService.isLoggedIn()) {
  //         this.marketVisitsService.getVisitCountUser(this.user_id).subscribe(
  //             (count: number) => {
  //                 if (count !== this.previousVisitCountUser) {
  //                     this.previousVisitCountUser = count;
  //                     this.visitCountUser = count;
  //                 }
  //             },
  //             (error) => {
  //                 console.error('Error fetching visit count:', error);
  //             }
  //         );
  //     }
  // }

 private getMarketVisitsDataAll(): void {
  if (this.authService.isLoggedIn()) {
    this.marketVisitsService.getMarketVisits().subscribe(
      (data: MarketVisits[]) => {
        console.log('Raw market visits data:', data);
        
        if (data.length !== this.previousMarketVisits.length) {
          this.previousMarketVisits = data;
          this.marketVisits = data;

          // Extract years
          const years = new Set<number>();
          data.forEach((visit) => {
            const year = new Date(visit.date_created).getFullYear();
            years.add(year);
          });
          this.yearOptions = Array.from(years).sort((a, b) => b - a);

          // Set default year if not set
          if (!this.selectedYear && this.yearOptions.length > 0) {
            this.selectedYear = this.yearOptions[0];
          }

          // Build chart data from raw visits
          this.updateChartDataByYear(this.selectedYear);
          
          // Also update user chart data if role is user
          if (this.role_id === '2') {
            this.updateUserChartDataByYear(this.selectedYear);
          }
        }
      },
      (error) => {
        console.error('Error fetching market visits:', error);
      }
    );
  }
}

  // Other code remains the same...

  public userCount: number = 0; // Initialize to 0
  public isrCount: number = 0; // Initialize to 0
  public areaCount: number = 0; // Initialize to 0
  public podCount: number = 0; // Initialize to 0

  getStatusData(): number[] {
    const statusData = [
      this.userCount,
      this.isrCount,
      this.areaCount,
      this.podCount,
    ];
    // console.log('Status Data:', statusData); // Debugging line
    return statusData;
  }

  isDataReady(): boolean {
    return (
      this.userCount !== null &&
      this.isrCount !== null &&
      this.areaCount !== null &&
      this.podCount !== null
    );
  }

  private fetchAllCount(): void {
    if (this.authService.isLoggedIn()) {
      this.userService.getUserCount().subscribe(
        (userCount: number) => {
          this.userCount = userCount;
          // console.log('User Count:', this.userCount);

          this.isrService.getIsrCount().subscribe(
            (isrCount: number) => {
              this.isrCount = isrCount;
              // console.log('ISR Count:', this.isrCount);

              this.areaService.getAreaCount().subscribe(
                (areaCount: number) => {
                  this.areaCount = areaCount;
                  // console.log('Area Count:', this.areaCount);

                  this.podService.getPodsCount().subscribe(
                    (podCount: number) => {
                      this.podCount = podCount;
                      // console.log('Pod Count:', this.podCount);
                    },
                    (error) => {
                      // console.error('Error fetching pod count:', error);
                    }
                  );
                },
                (error) => {
                  // console.error('Error fetching area count:', error);
                }
              );
            },
            (error) => {
              // console.error('Error fetching ISR count:', error);
            }
          );
        },
        (error) => {
          // console.error('Error fetching user count:', error);
        }
      );
    }
  }
  private fetchChartData(): void {
    this.marketVisitsService.getChartData().subscribe(
      (data: { year: number; month: number; count: number }[]) => {
        this.chartData = data;
      },
      (error) => {
        console.error('Error fetching chart data:', error);
      }
    );
  }

  private fetchChartDataUser(): void {
    this.marketVisitsService.getChartDataUser().subscribe(
      (data) => {
        // console.log('Chart data:', data); // Debugging
        this.chartDataUser = data; // Store the data for passing to the chart component
      },
      (error) => {
        // console.error('Error fetching chart data:', error);
      }
    );
  }

onYearChange(): void {
  console.log(`Year changed to: ${this.selectedYear}`);
  console.log(`Role ID: ${this.role_id}`);
  console.log(`selectedYear type: ${typeof this.selectedYear}`);

  // Convert selectedYear to number to ensure proper comparison
  const yearAsNumber = parseInt(this.selectedYear.toString(), 10);
  console.log(`Converted year: ${yearAsNumber} (${typeof yearAsNumber})`);

  // Ensure we have market visits data before processing
  if (this.marketVisits.length === 0) {
    console.warn('No market visits data available yet');
    this.getMarketVisitsDataAll();
    return;
  }

  if (this.role_id === '1') {
    console.log('Calling updateChartDataByYear() for admin');
    this.updateChartDataByYear(yearAsNumber);
  } else if (this.role_id === '2') {
    console.log('Calling updateUserChartDataByYear() for user');
    this.updateUserChartDataByYear(yearAsNumber);
  } else {
    console.warn('Unknown role_id, no chart data update performed.');
  }
}

  
updateChartDataByYear(year: number): void {
  console.log(`Updating chart data for year: ${year} (${typeof year}) (Admin)`);

  const visitsInYear = this.marketVisits.filter((visit) => {
    const visitDate = new Date(visit.date_created);
    const visitYear = visitDate.getFullYear();
    const match = visitYear === year;
    
    // Add debugging for the first few visits
    if (this.marketVisits.indexOf(visit) < 3) {
      console.log(`Visit ${visit.id}: date=${visit.date_created}, visitYear=${visitYear} (${typeof visitYear}), targetYear=${year} (${typeof year}), match=${match}`);
    }
    
    return match;
  });

  console.log(`Found ${visitsInYear.length} visits in year ${year}`);

  const monthMap = new Map<number, number>();

  visitsInYear.forEach((visit) => {
    const month = new Date(visit.date_created).getMonth();
    const currentCount = monthMap.get(month) || 0;
    monthMap.set(month, currentCount + 1);
  });

  console.log('Month map:', Array.from(monthMap.entries()));

  this.chartData = Array.from({ length: 12 }, (_, index) => {
    const count = monthMap.get(index) || 0;
    return {
      year: year, // Ensure this is a number
      month: index + 1,
      count,
    };
  });

  console.log('Generated chartData:', this.chartData);
}


updateUserChartDataByYear(year: number): void {
  console.log(
    `Updating user-specific chart data for year: ${year} (${typeof year}), user_id: ${this.user_id}`
  );

  const visitsInYear = this.marketVisits.filter((visit) => {
    const visitDate = new Date(visit.date_created);
    const visitYear = visitDate.getFullYear();
    const yearMatch = visitYear === year;
    
    // Handle both string and number comparisons for user_id
    const userMatch = visit.user_id?.toString() === this.user_id?.toString();
    
    // Add debugging for the first few visits
    if (this.marketVisits.indexOf(visit) < 3) {
      console.log(`Visit ${visit.id}: date=${visit.date_created}, visitYear=${visitYear} (${typeof visitYear}), targetYear=${year} (${typeof year}), yearMatch=${yearMatch}, userMatch=${userMatch}`);
    }
    
    return yearMatch && userMatch;
  });

  console.log(`User has ${visitsInYear.length} visits in year ${year}`);

  const monthMap = new Map<number, number>();

  visitsInYear.forEach((visit) => {
    const month = new Date(visit.date_created).getMonth();
    const currentCount = monthMap.get(month) || 0;
    monthMap.set(month, currentCount + 1);
  });

  console.log('User Month map:', Array.from(monthMap.entries()));

  this.chartDataUser = Array.from({ length: 12 }, (_, index) => {
    const count = monthMap.get(index) || 0;
    return {
      year: year, // Ensure this is a number
      month: index + 1,
      count,
    };
  });

  console.log('Generated chartDataUser:', this.chartDataUser);
}
}