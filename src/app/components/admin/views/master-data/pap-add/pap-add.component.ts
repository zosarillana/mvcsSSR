import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { PapService } from '../../../../../services/pap.service';
import { Pap } from '../../../../../models/pap';
import { ModalCreatePapComponent } from './modal/modal-create-pap/modal-create-pap.component';
import { ModalEditPapComponent } from './modal/modal-edit-pap/modal-edit-pap.component';
import { ModalViewPapComponent } from './modal/modal-view-pap/modal-view-pap.component';
import { ModalDeletePapComponent } from './modal/modal-delete-pap/modal-delete-pap.component';
import { DatePipe } from '@angular/common';
import { FlowbiteService } from '../../../../../services/flowbite.service';
import { AuthService } from '../../../../../auth/auth.service';
import { SseService } from '../../../../../services/sse.service';
import { FormControl } from '@angular/forms';
import { map, Observable, startWith, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-pap-add',
  templateUrl: './pap-add.component.html',
  styleUrl: './pap-add.component.css',
})
export class PapAddComponent {
  displayedColumns: string[] = [
    'pod_name',
    'others',
    'description',
    'date_created',
    'action',
  ];
  dataSource = new MatTableDataSource<Pap>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  myControl = new FormControl('');
  options: string[] = []; // Initialize as empty
  paps: Pap[] = []; // Initialize as empty
  filteredOptions!: Observable<string[]>;
  private subscription: Subscription = new Subscription();
  podCount: number = 0;
  startDate: Date | null = null;
  endDate: Date | null = null;
  private intervalId: any;

  // Construct the base API URL
  private url = '/api/api/Pap';
  public imageUrlBase = `${this.url}/image/`; // <-- Use the environment API URL

  constructor(
    private sseService: SseService,
    private authService: AuthService,
    private papService: PapService,
    public dialog: MatDialog,
    private datePipe: DatePipe,
    private flowbiteService: FlowbiteService,
    private matSnackBar: MatSnackBar
  ) {}

  getFormattedVisitDate(visitDate: string | undefined): string {
    if (visitDate) {
      return this.datePipe.transform(new Date(visitDate), 'short') || 'No Date';
    }
    return 'No Date';
  }

  ngOnInit(): void {
    this.loadPaps();   
    this.subscribeToSseMessages();
    this.papService.getPaps().subscribe(
      (data) => {
        this.paps = data || [];
        this.setupAutocomplete();
      },
      (error) => {
        console.error('Error fetching Paps', error);
      }
    );
    this.flowbiteService.loadFlowbite((flowbite) => {
      // Your custom code here
      // console.log('Flowbite loaded', flowbite);
    });
  }

  setupAutocomplete() {
    // Extract mv_id values for the autocomplete options
    this.options = this.paps.map((pap) => pap.pap_name);

    // Setup autocomplete filtering
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value ?? '', this.options)) // Use current options
    );
  }

  private _filter(value: string, options: string[]): string[] {
    const filterValue = value.toUpperCase();
    return options.filter((option) =>
      option.toUpperCase().includes(filterValue)
    );
  }

  applyFilter(event: Event, filterType: string): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (filterType === 'pap') {
      this.dataSource.filterPredicate = (data: Pap) => {
        return data.pap_name.toLowerCase().includes(value.trim().toLowerCase());
      };
      this.dataSource.filter = value.trim().toLowerCase(); // Apply the filter
    }
  }
  applyFilterOnSelect(selectedOption: string): void {
    // Define the filter predicate
    this.dataSource.filterPredicate = (data: Pap) => {
      return data.pap_name.toUpperCase().includes(selectedOption.toUpperCase());
    };

    // Apply the new filter
    this.dataSource.filter = selectedOption.toUpperCase();
  } 
  
  applyDateFilter() {
    this.papService.getPaps().subscribe((result: Pap[]) => {
      let dataToDisplay = result;

      if (this.startDate && this.endDate) {
        dataToDisplay = dataToDisplay.filter((pap) => {
          const dateCreated = new Date(pap.date_created);
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

  loadPaps(): void {
    this.papService.getPaps().subscribe((result: Pap[]) => {
      this.dataSource.data = result;
      this.dataSource.paginator = this.paginator; // Set paginator after data is loaded

      // Fetch pod count initially
      this.fetchPapCount();                

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
      this.papService.getPaps().subscribe(
        (result: Pap[]) => {
          this.paps = result || []; // Update the local data
          this.setupAutocomplete(); // Reinitialize autocomplete
          this.updateDataSource(result); // Update data source for your table or list
          this.fetchPapCount(); // Update visit count if applicable
        },
        (error) => {
          console.error('Error fetching market visits on SSE update:', error);
        }
      );
    })
  );
}
private updateDataSource(result: Pap[]): void {
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

  private fetchPapCount(): void {
    if (this.authService.isLoggedIn()) {
      this.papService.getPapsCount().subscribe(
        (count: number) => {
          this.podCount = count;
        },
        (error) => {
          console.error('Error fetching pod count:', error);
        }
      );
    }
  }
  ngOnDestroy(): void {
  }

  openViewDialog(pap: Pap): void {
    const dialogRef = this.dialog.open(ModalViewPapComponent, {
      width: '500px',
      data: pap,
    });

    dialogRef.afterClosed().subscribe(() => this.loadPaps());
  }

  openEditDialog(pap: Pap): void {
    const dialogRef = this.dialog.open(ModalEditPapComponent, {
      width: '500px',
      data: pap,
    });

    dialogRef.afterClosed().subscribe(() => this.loadPaps());
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(ModalCreatePapComponent, {
      width: '900px',
      height: 'auto',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPaps();
      }
    });
  }

  openDeleteDialog(pap: Pap): void {
    const dialogRef = this.dialog.open(ModalDeletePapComponent, {
      width: '500px',
      data: pap,
    });

    dialogRef.afterClosed().subscribe(() => this.loadPaps());
  }
}
