import { Component, ViewChild } from '@angular/core';
import { Isr } from '../../../../../models/isr';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { IsrService } from '../../../../../services/isr.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalCreateIsrComponent } from './modal/modal-create-isr/modal-create-isr.component';
import { ModalEditIsrComponent } from './modal/modal-edit-isr/modal-edit-isr.component';
import { ModalViewIsrComponent } from './modal/modal-view-isr/modal-view-isr.component';
import { ModalDeleteIsrComponent } from './modal/modal-delete-isr/modal-delete-isr.component';
import { DatePipe } from '@angular/common';
import { FlowbiteService } from '../../../../../services/flowbite.service';
import { AuthService } from '../../../../../auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';
import { map, Observable, startWith, Subscription } from 'rxjs';
import { SseService } from '../../../../../services/sse.service';

@Component({
  selector: 'app-isr-add',
  templateUrl: './isr-add.component.html',
  styleUrls: ['./isr-add.component.css'],
})
export class IsrAddComponent {
  displayedColumns: string[] = [
    'isr_name',
    'others',
    'type',
    // 'image_path',
    'description',
    'date_created',
    'action',
  ];
  dataSource = new MatTableDataSource<Isr>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  isrCount: number = 0;
  startDate: Date | null = null;
  endDate: Date | null = null;
  isrs: Isr[] = [];
  myControl = new FormControl('');
  options: string[] = []; // Initialize as empty
  filteredOptions!: Observable<string[]>;
  private intervalId: any;
  private subscription: Subscription = new Subscription();
  private url = '/api/api/Isr';
  // Construct the base API URL
  public imageUrlBase = `${this.url}/image/`; // <-- Use the environment API URL

  constructor(
    private authService: AuthService,
    private flowbiteService: FlowbiteService,
    private isrService: IsrService,
    private datePipe: DatePipe,
    private matSnackBar: MatSnackBar,
    public dialog: MatDialog,
    private sseService: SseService
  ) {}

  getFormattedVisitDate(visitDate: string | undefined): string {
    if (visitDate) {
      return this.datePipe.transform(new Date(visitDate), 'short') || 'No Date';
    }
    return 'No Date';
  }
  
  ngOnInit(): void {
    this.loadIsrs();    
    
    this.subscribeToSseMessages();

    this.isrService.getIsrs().subscribe(
      (data) => {
        this.isrs = data || [];
        this.setupAutocomplete();
      },
      (error) => {
        console.error('Error fetching market visits', error);
      }   
    );

    this.flowbiteService.loadFlowbite(flowbite => {
      // Your custom code here
      console.log('Flowbite loaded', flowbite);
    });
  }

  setupAutocomplete() {
    // Extract mv_id values for the autocomplete options
    this.options = this.isrs.map((isr) => isr.isr_name);

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

    if (filterType === 'isr') {
      this.dataSource.filterPredicate = (data: Isr) => {
        return data.isr_name.toLowerCase().includes(value.trim().toLowerCase());
      };
      this.dataSource.filter = value.trim().toLowerCase(); // Apply the filter
    }
  }
  applyFilterOnSelect(selectedOption: string): void {
    // Define the filter predicate
    this.dataSource.filterPredicate = (data: Isr) => {
      return data.isr_name.toLowerCase().includes(selectedOption.toLowerCase());
    };

    // Apply the new filter
    this.dataSource.filter = selectedOption.toLowerCase();
  } 

  applyDateFilter() {
    this.isrService
      .getIsrs()
      .subscribe((result: Isr[]) => {
        let dataToDisplay = result;  

        if (this.startDate && this.endDate) {
          dataToDisplay = dataToDisplay.filter((isr) => {
            const dateCreated = new Date(isr.date_created);
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

  // applyDateFilter(type: string, event: MatDatepickerInputEvent<Date>): void {
  //   const date = event.value;

  //   if (type === 'start') {
  //     this.startDate = date;
  //   } else {
  //     this.endDate = date;
  //   }

  //   this.dataSource.filterPredicate = (data: Isr) => {
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

  loadIsrs(): void {
    this.isrService.getIsrs().subscribe((result: Isr[]) => {
      this.dataSource.data = result;
      this.dataSource.paginator = this.paginator; // Set paginator after data is loaded      
      this.fetchIsrCount();
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
        this.isrService.getIsrs().subscribe(
          (result: Isr[]) => {
            this.isrs = result || []; // Update the local data
            this.setupAutocomplete(); // Reinitialize autocomplete
            this.updateDataSource(result); // Update data source for your table or list
            this.fetchIsrCount(); // Update visit count if applicable
          },
          (error) => {
            console.error('Error fetching market visits on SSE update:', error);
          }
        );
      })
    );
  }
  private updateDataSource(result: Isr[]): void {
    let dataToDisplay = result;

    if (this.startDate && this.endDate) {
      dataToDisplay = dataToDisplay.filter((isr) => {
        const visitDate = new Date(isr.date_created);
        // Check if startDate and endDate are not null
        return this.startDate && this.endDate
          ? visitDate >= this.startDate && visitDate <= this.endDate
          : true; // If either is null, do not filter by date
      });
    }
  }
  private fetchIsrCount(): void {
    if (this.authService.isLoggedIn()) {
      this.isrService.getIsrCount().subscribe(
        (count: number) => {
          this.isrCount = count;
        },
        (error) => {
          console.error('Error fetching ISR count:', error);
        }
      );
    }
  }

  ngOnDestroy(): void {
    // Clean up polling interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }


  openViewDialog(isr: Isr): void {
    const dialogRef = this.dialog.open(ModalViewIsrComponent, {
      width: '500px',
      data: isr,
    });

    dialogRef.afterClosed().subscribe(() => this.loadIsrs());
  }

  openEditDialog(isr: Isr): void {
    const dialogRef = this.dialog.open(ModalEditIsrComponent, {
      width: '500px',
      data: isr,
    });

    dialogRef.afterClosed().subscribe(() => this.loadIsrs());
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(ModalCreateIsrComponent, {
      width: '900px',
      height: 'auto',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadIsrs();
      }
    });
  }

  openDeleteDialog(isr: Isr): void {
    const dialogRef = this.dialog.open(ModalDeleteIsrComponent, {
      width: '500px',
      data: isr,
    });

    dialogRef.afterClosed().subscribe(() => this.loadIsrs());
  }
}
