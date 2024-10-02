import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { map, Observable, startWith, Subscription } from 'rxjs';
import { Area } from '../../../../../models/area';
import { AreaService } from '../../../../../services/area.service';
import { ModalCreateAreaComponent } from './modal/modal-create-area/modal-create-area.component';
import { ModalViewAreaComponent } from './modal/modal-view-area/modal-view-area.component';
import { ModalDeleteAreaComponent } from './modal/modal-delete-area/modal-delete-area.component';
import { ModalEditAreaComponent } from './modal/modal-edit-area/modal-edit-area.component';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../../../auth/auth.service';
import { FormControl } from '@angular/forms';
import { FlowbiteService } from '../../../../../services/flowbite.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SseService } from '../../../../../services/sse.service';
@Component({
  selector: 'app-area-add',
  templateUrl: './area-add.component.html',
  styleUrls: ['./area-add.component.css'], // Corrected to 'styleUrls'
})
export class AreaAddComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'area',
    'description',
    'date_created',
    'action',
  ];
  dataSource = new MatTableDataSource<Area>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  myControl = new FormControl('');
  options: string[] = []; // Initialize as empty
  filteredOptions!: Observable<string[]>;
  areaCount: number = 0;
  startDate: Date | null = null;
  endDate: Date | null = null;
  areas: Area[] = [];
  private subscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private areaService: AreaService,
    public dialog: MatDialog,
    private datePipe: DatePipe,
    private matSnackBar: MatSnackBar,
    private flowbiteService: FlowbiteService,
    private sseService: SseService
  ) {}
  ngOnInit(): void {
    this.subscribeToSseMessages();
    this.loadAreas();
    // this.startPolling();
    this.areaService.getAreas().subscribe(
      (data) => {
        this.areas = data || [];
        this.setupAutocomplete();
      },
      (error) => {
        console.error('Error fetching Areas', error);
      }
    );

    // const eventSource = new EventSource('/api/api/sse/subscribe'); // Replace with your API URL for SSE

    //   eventSource.onmessage = (event) => {
    //     const message = event.data;
    //     console.log('Received SSE message:', message);

    //     // Display the message using MatSnackBar
    //     this.matSnackBar.open(message, 'Close', {
    //       duration: 3000, // Duration in milliseconds
    //     });

    //     // Fetch the latest data and update the options
    //     this.areaService.getAreas().subscribe(
    //       (result: Area[]) => {
    //         this.areas = result || [];
    //         this.setupAutocomplete(); // Reinitialize autocomplete with the latest options
    //       },
    //       (error) => {
    //         console.error('Error fetching market visits on SSE update:', error);
    //       }
    //     );
    //   };

    //   eventSource.onerror = (error) => {
    //     console.error('SSE error:', error);
    //     eventSource.close();
    //   };

    //   // Load Flowbite (if needed)
    //   this.flowbiteService.loadFlowbite((flowbite) => {
    //     console.log('Flowbite loaded', flowbite);
    //   });
  }
  // applyDateFilter(type: string, event: MatDatepickerInputEvent<Date>): void {
  //   const date = event.value;

  //   if (type === 'start') {
  //     this.startDate = date;
  //   } else {
  //     this.endDate = date;
  //   }

  //   this.dataSource.filterPredicate = (data: Area) => {
  //     const createdDate = moment(data.date_created);
  //     const withinStart = this.startDate
  //       ? createdDate.isSameOrAfter(this.startDate)
  //       : true;
  //     const withinEnd = this.endDate
  //       ? createdDate.isSameOrBefore(this.endDate)
  //       : true;
  //     return withinStart && withinEnd;
  //   };
  //   this.dataSource.filter = '' + Math.random(); // Trigger filtering
  // }
  setupAutocomplete() {
    // Extract mv_id values for the autocomplete options
    this.options = this.areas.map((area) => area.area);

    // Setup autocomplete filtering
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value ?? '', this.options)) // Use current options
    );
  }

  private _filter(value: string, options: string[]): string[] {
    const filterValue = value.toLowerCase();
    return options.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  applyFilter(event: Event, filterType: string): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (filterType === 'area') {
      this.dataSource.filterPredicate = (data: Area) => {
        return data.area.toLowerCase().includes(value.trim().toLowerCase());
      };
      this.dataSource.filter = value.trim().toLowerCase(); // Apply the filter
    }
  }
  applyFilterOnSelect(selectedOption: string): void {
    // Define the filter predicate
    this.dataSource.filterPredicate = (data: Area) => {
      return data.area.toLowerCase().includes(selectedOption.toLowerCase());
    };

    // Apply the new filter
    this.dataSource.filter = selectedOption.toLowerCase();
  }

  applyDateFilter() {
    this.areaService.getAreas().subscribe((result: Area[]) => {
      let dataToDisplay = result;

      if (this.startDate && this.endDate) {
        dataToDisplay = dataToDisplay.filter((user) => {
          const dateCreated = new Date(user.date_created);
          // Check if startDate and endDate are not null
          return this.startDate && this.endDate
            ? dateCreated >= this.startDate && dateCreated <= this.endDate
            : true; // If either is null, do not filter by date
        });
      }

      this.dataSource.data = dataToDisplay;
    });
  }

  onStartDateChange(event: any) {
    this.startDate = event.value;
    this.applyDateFilter();
  }

  onEndDateChange(event: any) {
    this.endDate = event.value;
    this.applyDateFilter();
  }

  loadAreas(): void {
    this.areaService.getAreas().subscribe((result: Area[]) => {
      this.dataSource.data = result;
      this.dataSource.paginator = this.paginator; // Set paginator after data is loaded
      this.fetchAreaCount();

      // Start polling for area count
      // this.startPolling();
    });
  }
  // Subscribe to SSE messages instead of WebSocket
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
        this.areaService.getAreas().subscribe(
          (result: Area[]) => {
            this.areas = result || []; // Update the local data
            this.setupAutocomplete(); // Reinitialize autocomplete
            this.updateDataSource(result); // Update data source for your table or list
            this.fetchAreaCount(); // Update visit count if applicable
          },
          (error) => {
            console.error('Error fetching market visits on SSE update:', error);
          }
        );
      })
    );
  }
  private updateDataSource(result: Area[]): void {
    let dataToDisplay = result;

    if (this.startDate && this.endDate) {
      dataToDisplay = dataToDisplay.filter((visit) => {
        const visitDate = new Date(visit.date_created);
        // Check if startDate and endDate are not null
        return this.startDate && this.endDate
          ? visitDate >= this.startDate && visitDate <= this.endDate
          : true; // If either is null, do not filter by date
      });
    }
  }
  private fetchAreaCount(): void {
    if (this.authService.isLoggedIn()) {
      this.areaService.getAreaCount().subscribe(
        (count: number) => {
          this.areaCount = count;
        },
        (error) => {
          console.error('Error fetching area count:', error);
        }
      );
    }
  }

  // private startPolling(): void {
  //   // Clear any existing interval
  //   // if (this.intervalId) {
  //   //   clearInterval(this.intervalId);
  //   // }

  //   // // Set up polling every 3 seconds
  //   // this.intervalId = setInterval(() => {
  //   //   if (this.authService.isLoggedIn()) {
  //   //     this.fetchAreaCount();
  //   //   }
  //   // }, 3000);
  // }

  ngOnDestroy(): void {
    // Clean up polling interval and subscriptions
    // if (this.intervalId) {
    //   clearInterval(this.intervalId);
    // }
    // if (this.pollingSubscription) {
    //   this.pollingSubscription.unsubscribe();
    // }
  }

  getFormattedVisitDate(visitDate: string | undefined): string {
    if (visitDate) {
      return this.datePipe.transform(new Date(visitDate), 'short') || 'No Date';
    }
    return 'No Date';
  }

  private fetchUserCount(): void {
    this.areaService.getAreaCount().subscribe(
      (count: number) => {
        this.areaCount = count;
      },
      (error) => {
        console.error('Error fetching area count:', error);
      }
    );
  }

  openEditDialog(area: Area): void {
    const dialogRef = this.dialog.open(ModalEditAreaComponent, {
      width: '500px',
      data: area,
    });

    dialogRef.afterClosed().subscribe(() => this.loadAreas());
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(ModalCreateAreaComponent, {
      width: '500px',
      height: 'auto',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadAreas();
      }
    });
  }

  openDeleteDialog(area: Area): void {
    const dialogRef = this.dialog.open(ModalDeleteAreaComponent, {
      width: '500px',
      data: area,
    });

    dialogRef.afterClosed().subscribe(() => this.loadAreas());
  }

  openViewDialog(area: Area): void {
    const dialogRef = this.dialog.open(ModalViewAreaComponent, {
      width: '500px',
      data: area,
      disableClose: true, // Prevents closing the dialog by clicking outside or pressing ESC
      autoFocus: true, // Automatically focuses the first focusable element in the dialog
      restoreFocus: true, // Restores focus to the element that triggered the dialog after it closes
    });

    dialogRef.afterClosed().subscribe(() => this.loadAreas());
  }
}
