import { Component, ViewChild } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import moment from 'moment';
import { map, Observable, startWith, Subscription } from 'rxjs';
import { ModalCreatePodComponent } from './modal/modal-create-pod/modal-create-pod.component';
import { PodService } from '../../../../../services/pod.service';
import { ModalEditPodComponent } from './modal/modal-edit-pod/modal-edit-pod.component';
import { ModalViewPodComponent } from './modal/modal-view-pod/modal-view-pod.component';
import { ModalDeletePodComponent } from './modal/modal-delete-pod/modal-delete-pod.component';
import { Pod } from '../../../../../models/pod';
import { DatePipe } from '@angular/common';
import { FlowbiteService } from '../../../../../services/flowbite.service';
import { AuthService } from '../../../../../auth/auth.service';
import { FormControl } from '@angular/forms';
import { SseService } from '../../../../../services/sse.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Area } from '../../../../../models/area';
@Component({
  selector: 'app-pod-add',
  templateUrl: './pod-add.component.html',
  styleUrl: './pod-add.component.css',
})
export class PodAddComponent {
  displayedColumns: string[] = [
    'pod_name',
    'others',
    'type',
    'description',
    'date_created',
    'action',
  ];
  dataSource = new MatTableDataSource<Pod>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  podCount: number = 0;
  startDate: Date | null = null;
  endDate: Date | null = null;
  myControl = new FormControl('');
  options: string[] = []; // Initialize as empty
  filteredOptions!: Observable<string[]>;
  pods: Pod[] = [];
  private subscription: Subscription = new Subscription();
  private pollingSubscription: Subscription = new Subscription();
  private intervalId: any;


  // Construct the base API URL
  private url = '/api/api/Pod';
  public imageUrlBase = `${this.url}/image/`; 

  constructor(    
    private sseService: SseService,
    private matSnackBar: MatSnackBar,
    private authService: AuthService,
    private flowbiteService: FlowbiteService,
    private podService: PodService,
    public dialog: MatDialog,
    private datePipe: DatePipe
  ) {}

  getFormattedVisitDate(visitDate: string | undefined): string {
    if (visitDate) {
      return this.datePipe.transform(new Date(visitDate), 'short') || 'No Date';
    }
    return 'No Date';
  }
  
  ngOnInit(): void {
    this.subscribeToSseMessages();
    this.loadPods();
    this.podService.getPods().subscribe(
      (data) => {
        this.pods = data || [];
        this.setupAutocomplete();
      },
      (error) => {
        console.error('Error fetching Product on Display', error);
      }
    );
    this.flowbiteService.loadFlowbite(flowbite => {
      // Your custom code here
      console.log('Flowbite loaded', flowbite);
    });
  
  }

  setupAutocomplete() {
    // Extract mv_id values for the autocomplete options
    this.options = this.pods.map((pod) => pod.pod_name);

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

    if (filterType === 'pod') {
      this.dataSource.filterPredicate = (data: Pod) => {
        return data.pod_name.toLowerCase().includes(value.trim().toLowerCase());
      };
      this.dataSource.filter = value.trim().toLowerCase(); // Apply the filter
    }
  }
  applyFilterOnSelect(selectedOption: string): void {
    // Define the filter predicate
    this.dataSource.filterPredicate = (data: Pod) => {
      return data.pod_name.toLowerCase().includes(selectedOption.toLowerCase());
    };

    // Apply the new filter
    this.dataSource.filter = selectedOption.toLowerCase();
  }

  applyDateFilter() {
    this.podService.getPods().subscribe((result: Pod[]) => {
      let dataToDisplay = result;

      if (this.startDate && this.endDate) {
        dataToDisplay = dataToDisplay.filter((pod) => {
          const dateCreated = new Date(pod.date_created);
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


  loadPods(): void {
    this.podService.getPods().subscribe((result: Pod[]) => {
      this.dataSource.data = result;
      this.dataSource.paginator = this.paginator; // Set paginator after data is loaded

      // Fetch pod count initially
      this.fetchPodCount();      
    });
  }

  // Subscribe to SSE messages instead of WebSocket
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
        this.podService.getPods().subscribe(
          (result: Pod[]) => {
            this.pods = result || []; // Update the local data
            this.setupAutocomplete(); // Reinitialize autocomplete
            this.updateDataSource(result); // Update data source for your table or list
            this.fetchPodCount(); // Update visit count if applicable
          },
          (error) => {
            console.error('Error fetching market visits on SSE update:', error);
          }
        );
      })
    );
  }
  private updateDataSource(result: Pod[]): void {
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

  private fetchPodCount(): void {
    if (this.authService.isLoggedIn()) {
      this.podService.getPodsCount().subscribe(
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


  openViewDialog(isr: Pod): void {
    const dialogRef = this.dialog.open(ModalViewPodComponent, {
      width: '500px',
      data: isr,
    });

    dialogRef.afterClosed().subscribe(() => this.loadPods());
  }

  openEditDialog(isr: Pod): void {
    const dialogRef = this.dialog.open(ModalEditPodComponent, {
      width: '500px',
      data: isr,
    });

    dialogRef.afterClosed().subscribe(() => this.loadPods());
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(ModalCreatePodComponent, {
      width: '900px',
      height: 'auto',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPods();
      }
    });
  }

  openDeleteDialog(isr: Pod): void {
    const dialogRef = this.dialog.open(ModalDeletePodComponent, {
      width: '500px',
      data: isr,
    });

    dialogRef.afterClosed().subscribe(() => this.loadPods());
  }
}
