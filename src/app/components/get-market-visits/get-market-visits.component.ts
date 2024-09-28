import {
  AfterViewInit,
  Component,
  ViewChild,
  OnInit,
  ChangeDetectorRef,
  Input,
} from '@angular/core';
// import { WebSocketService } from '../../services/websocket.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import { MarketVisits } from '../../models/market-visits';
import { MarketVisitsService } from '../../services/market-visits.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalDeleteDialogComponent } from './modal/modal-delete-dialog/modal-delete-dialog.component';
import { SharedService } from '../../services/shared.service';
import { map, Observable, Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';
import { FlowbiteService } from '../../services/flowbite.service';
import { TokenService } from '../../services/token.service';
import { AuthService } from '../../auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';
import { startWith } from 'rxjs/operators';
import { SseService } from '../../services/sse.service';
@Component({
  selector: 'app-get-market-visits',
  templateUrl: './get-market-visits.component.html',
  styleUrls: ['./get-market-visits.component.css'],
})
export class GetMarketVisitsComponent implements AfterViewInit, OnInit {
  myControl = new FormControl('');
  options: string[] = []; // Initialize as empty
  filteredOptions!: Observable<string[]>;
  @Input() mvisit?: MarketVisits;
  displayedColumns: string[] = [
    'mv_id',
    'visit_area',
    'visit_date',
    'visit_accountName',
    'visit_distributor',
    'visit_salesPersonnel',
    'visit_accountType',
    'date_created',
    'action',
  ];

  // Method to filter 'isrs'
  public filterIsrsForNeeds(isrs: any[]): any[] {
    return isrs.filter((isr) => isr.isr_type === 'NEEDS');
  }
  public filterIsrsForReqs(isrs: any[]): any[] {
    return isrs.filter((isr) => isr.isr_type === 'REQUIREMENTS');
  }
  // Method to filter 'Pods'
  public filterPodsForCanned(pods: any[]): any[] {
    return pods.filter((pod) => pod.pod_type === 'CANNED');
  }
  public filterPodsForMpp(pods: any[]): any[] {
    return pods.filter((pod) => pod.pod_type === 'MPP');
  }
  dataSource = new MatTableDataSource<MarketVisits>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  private previousVisitCount: number | null = null;
  mvisitsToEdit?: MarketVisits;
  startDate: Date | null = null;
  endDate: Date | null = null;
  visitCount: number = 0;
  role_id: string | null = null;
  user_id: string | null = null;
  mvisits: MarketVisits[] = [];
  private subscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private flowbiteService: FlowbiteService,
    private datePipe: DatePipe,
    private marketVisitsService: MarketVisitsService,
    public dialog: MatDialog,
    private sharedService: SharedService, // Inject SharedService
    private tokenService: TokenService,
    // private webSocketService: WebSocketService,
    private sseService: SseService,
    private matSnackBar: MatSnackBar
  ) {}

  ngOnInit(): void {  
    this.loadMarketVisits(); // Load initial data
    this.subscribeToSseMessages();
    this.marketVisitsService.getMarketVisits().subscribe(
      (data) => {
        this.mvisits = data || [];
        this.setupAutocomplete();
      },
      (error) => {
        console.error('Error fetching market visits', error);
      }
    );

    this.tokenService.decodeTokenAndSetUser();
    const user = this.tokenService.getUser();
    this.role_id = user?.role_id ?? null;
    this.user_id = user?.id ?? null;
    this.cdr.detectChanges();
    this.updateVisitCount();

    // Subscribe to WebSocket messages
    // this.webSocketService.messages$.subscribe(message => {
    //   console.log('Received WebSocket message:', message);
    //   this.matSnackBar.open(message, 'Close', {
    //duration: 3000, // Duration in milliseconds
    // });

    // Fetch the latest data and update the options
    // this.marketVisitsService.getMarketVisits().subscribe(
    //   (result: MarketVisits[]) => {
    //     this.mvisits = result || [];
    //     this.setupAutocomplete(); // Reinitialize autocomplete with the latest options
    //     this.updateDataSource(result);
    //     this.updateVisitCount();
    //   },
    //   (error) => {
    //     console.error('Error fetching market visits on WebSocket update:', error);
    //   }
    // );
    // });

    this.flowbiteService.loadFlowbite((flowbite) => {
      console.log('Flowbite loaded', flowbite);
    });
  }

  setupAutocomplete() {
    // Extract mv_id values for the autocomplete options
    this.options = this.mvisits.map((visit) => visit.mv_id);

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

    if (filterType === 'mvId') {
      this.dataSource.filterPredicate = (data: MarketVisits) => {
        return data.mv_id.toLowerCase().includes(value.trim().toLowerCase());
      };
      this.dataSource.filter = value.trim().toLowerCase(); // Apply the filter
    }
  }
  applyFilterOnSelect(selectedOption: string): void {
    // Define the filter predicate
    this.dataSource.filterPredicate = (data: MarketVisits) => {
      return data.mv_id.toLowerCase().includes(selectedOption.toLowerCase());
    };

    // Apply the new filter
    this.dataSource.filter = selectedOption.toLowerCase();
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
        this.marketVisitsService.getMarketVisits().subscribe(
          (result: MarketVisits[]) => {
            this.mvisits = result || []; // Update the local data
            this.setupAutocomplete(); // Reinitialize autocomplete
            this.updateDataSource(result); // Update data source for your table or list
            this.updateVisitCount(); // Update visit count if applicable
          },
          (error) => {
            console.error('Error fetching market visits on SSE update:', error);
          }
        );
      })
    );
  }

  // eventSource.onerror = (error) => {
  //   console.error('SSE error:', error);
  //   eventSource.close();
  // };

  // Load Flowbite (if needed)
  ngOnDestroy(): void {
    // Unsubscribe from WebSocket messages
    // if (this.webSocketSubscription) {
    //   this.webSocketSubscription.unsubscribe();
    // }
  }

  private updateDataSource(result: MarketVisits[]): void {
    let dataToDisplay = result;

    if (this.role_id === '2') {
      dataToDisplay = result.filter(
        (visit) => visit.user?.user_id?.toString() === this.user_id
      );
    }

    if (this.startDate && this.endDate) {
      dataToDisplay = dataToDisplay.filter((visit) => {
        const visitDate = new Date(visit.visit_date);
        // Check if startDate and endDate are not null
        return this.startDate && this.endDate
          ? visitDate >= this.startDate && visitDate <= this.endDate
          : true; // If either is null, do not filter by date
      });
    }

    this.dataSource.data = dataToDisplay;
  }

  onStartDateChange(event: any) {
    this.startDate = event.value;
    this.applyDateFilter();
  }

  onEndDateChange(event: any) {
    this.endDate = event.value;
    this.applyDateFilter();
  }

  applyDateFilter() {
    this.marketVisitsService
      .getMarketVisits()
      .subscribe((result: MarketVisits[]) => {
        let dataToDisplay = result;

        if (this.role_id === '2') {
          dataToDisplay = result.filter(
            (visit) => visit.user?.user_id?.toString() === this.user_id
          );
        }

        if (this.startDate && this.endDate) {
          dataToDisplay = dataToDisplay.filter((visit) => {
            const visitDate = new Date(visit.visit_date);
            // Check if startDate and endDate are not null
            return this.startDate && this.endDate
              ? visitDate >= this.startDate && visitDate <= this.endDate
              : true; // If either is null, do not filter by date
          });
        }

        this.dataSource.data = dataToDisplay;
      });
  }

  // applyDateFilter(type: string, event: MatDatepickerInputEvent<Date>): void {
  //   const date = event.value;

  //   if (type === 'start') {
  //     this.startDate = date;
  //   } else {
  //     this.endDate = date;
  //   }

  //   this.dataSource.filterPredicate = (data: MarketVisits) => {
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
  // applyDateFilter(event: { value: Date[] | null }): void {
  //   const dateRange = event.value;

  //   if (dateRange && dateRange.length === 2) {
  //     this.startDate = dateRange[0];
  //     this.endDate = dateRange[1];
  //   } else {
  //     this.startDate = null;
  //     this.endDate = null;
  //   }

  //   this.dataSource.filterPredicate = (data: MarketVisits) => {
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

  loadMarketVisits(): void {
    this.marketVisitsService
      .getMarketVisits()
      .subscribe((result: MarketVisits[]) => {
        let dataToDisplay = result;

        // Apply filtering only if role_id is 2
        if (this.role_id === '2') {
          dataToDisplay = result.filter(
            (visit) => visit.user?.user_id?.toString() === this.user_id
          );
          console.log('Filtered Data for role_id 2:', dataToDisplay);
        } else {
          console.log('Unfiltered Data for other roles:', dataToDisplay);
        }

        // Apply date filtering
        if (this.startDate && this.endDate) {
          dataToDisplay = dataToDisplay.filter((visit) => {
            const visitDate = new Date(visit.visit_date);
            // Check if startDate and endDate are not null
            return this.startDate && this.endDate
              ? visitDate >= this.startDate && visitDate <= this.endDate
              : true; // If either is null, do not filter by date
          });
        }

        // Assign filtered or unfiltered data to the data source
        this.dataSource.data = dataToDisplay;
      });
  }

  getFormattedVisitDate(visitDate: string | undefined): string {
    if (visitDate) {
      return this.datePipe.transform(new Date(visitDate), 'short') || 'No Date';
    }
    return 'No Date';
  }
  // private pollingSubscription: Subscription = new Subscription();
  // private previousVisitCount: number | null = null; // To keep track of the previous visit count
  // private startPolling(): void {
  //   // Poll every 60 seconds
  //   this.pollingSubscription.add(
  //     interval(60000).pipe(
  //       switchMap(() => {
  //         if (this.authService.isLoggedIn()) {
  //           return this.marketVisitsService.getVisitCount();
  //         } else {
  //           return of(null);
  //         }
  //       })
  //     ).subscribe(
  //       (count: number | null) => {
  //         if (count !== null && count !== this.previousVisitCount) {
  //           this.previousVisitCount = count;
  //           this.visitCount = count;
  //         }
  //       },
  //       error => {
  //         console.error('Error fetching visit count:', error);
  //       }
  //     )
  //   );
  // }

  // This method could be triggered by some event in your application
  // refreshData() {
  //   this.refreshDataEvent.next();
  // }

  // ngOnDestroy(): void {
  //   // Clean up subscriptions to prevent memory leaks
  //   this.pollingSubscription.unsubscribe();
  // }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  updateVisitList(mvisits: MarketVisits[]) {
    this.dataSource.data = mvisits;
  }

  initNewMvisits() {
    this.mvisitsToEdit = new MarketVisits();
  }

  editMvisits(visit: MarketVisits): void {
    this.mvisitsToEdit = visit;
  }
  openDeleteDialog(visit: MarketVisits): void {
    const dialogRef = this.dialog.open(ModalDeleteDialogComponent, {
      width: '500px',
      data: visit,
    });

    dialogRef.afterClosed().subscribe(() => this.loadMarketVisits());
  }

  // openDeleteDialog(mvisit: MarketVisits): void {
  //   const dialogRef = this.dialog.open(ModalDeleteDialogComponent, {
  //     width: '500px',
  //     data: mvisit,
  //   });

  //   dialogRef.afterClosed().subscribe((result) => {
  //     console.log('The dialog was closed');
  //     if (result) {
  //       this.loadMarketVisits();
  //     }
  //   });
  // }

  public async exportMarketVisitsToExcel(): Promise<void> {
    try {
      // Fetch data from the API
      const marketVisits = await this.marketVisitsService
        .getMarketVisits()
        .toPromise();

      // Ensure marketVisits is defined and handle if it's undefined
      const safeMarketVisits: MarketVisits[] = marketVisits || [];

      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Market Visits');

      // Define column headers
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Visitted Areas', key: 'visit_area', width: 50 },
        { header: 'Visit Date', key: 'visit_date', width: 20 },
        { header: 'Account Name', key: 'visit_accountName', width: 30 },
        { header: 'Distributor', key: 'visit_distributor', width: 20 },
        { header: 'Sales Personnel', key: 'visit_salesPersonnel', width: 20 },
        { header: 'Account Types', key: 'visit_accountType', width: 50 },
        {
          header: 'Other Account Types',
          key: 'visit_accountType_others',
          width: 50,
        },
        { header: 'ISR Requirements', key: 'visit_isr', width: 50 },
        { header: 'ISR Req Others', key: 'isr_reqOthers', width: 15 },

        { header: 'ISR Need', key: 'visit_isrNeed', width: 50 },
        { header: 'ISR Need Others', key: 'isr_needOthers', width: 15 },
        {
          header: 'Payola Merchandiser',
          key: 'visit_payolaMerchandiser',
          width: 25,
        },
        {
          header: 'Average Off Take PD',
          key: 'visit_averageOffTakePd',
          width: 25,
        },
        { header: 'Pod Canned', key: 'pod_canned', width: 50 },
        { header: 'Pod Canned Others', key: 'pod_canned_other', width: 15 },

        { header: 'Pod MPP', key: 'pod_mpp', width: 50 },
        { header: 'Pod MPP Others', key: 'pod_mpp_other', width: 15 },
        {
          header: 'Competitors Check',
          key: 'visit_competitorsCheck',
          width: 25,
        },
        { header: 'Proposed Action Plan', key: 'visit_pap', width: 35 },
        { header: 'Other Proposed Action Plan', key: 'pap_others', width: 35 },
      ];

      // Style the header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.alignment = { horizontal: 'center' };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '800000' }, // Yellow background
      };
      headerRow.height = 30; // Adjust the height as needed

      // Add rows to the worksheet
      safeMarketVisits.forEach((item: MarketVisits) => {
        // Convert areas and account types to comma-separated strings or default text if empty
        const areasString =
          item.areas && item.areas.length > 0
            ? item.areas.map((area) => area.area_name).join(', ')
            : 'No Areas';
        const accountsString =
          item.accountTypes && item.accountTypes.length > 0
            ? item.accountTypes
                .map((AccountType) => AccountType.accountType_name)
                .join(', ')
            : 'No Account Types';
        // Filter ISRs
        const isrsForNeeds = this.filterIsrsForNeeds(item.isrs);
        const isrNeedString =
          isrsForNeeds.length > 0
            ? isrsForNeeds.map((isr) => isr.isr_name).join(', ')
            : 'No ISR Needs';

        const isrsForReqs = this.filterIsrsForReqs(item.isrs);
        const isrReqString =
          isrsForReqs.length > 0
            ? isrsForReqs.map((isr) => isr.isr_name).join(', ')
            : 'No ISR Requirements';

        // Filter PODs
        const podsForCanned = this.filterPodsForCanned(item.pods);
        const podsCannedString =
          podsForCanned.length > 0
            ? podsForCanned.map((pod) => pod.pod_name).join(', ')
            : 'No ISR CANNED';

        const podsForMPP = this.filterPodsForMpp(item.pods);
        const podsMPPString =
          podsForMPP.length > 0
            ? podsForMPP.map((pod) => pod.pod_name).join(', ')
            : 'No Pod MPPS';

        //For paps
        const papsString =
          item.paps && item.paps.length > 0
            ? item.paps.map((pap) => pap.pap_name).join(', ')
            : 'No Areas';

        const row = worksheet.addRow({
          id: item.id,
          visit_area: areasString,
          visit_date: item.visit_date,
          visit_accountName: item.visit_accountName,
          visit_distributor: item.visit_distributor,
          visit_salesPersonnel: item.visit_salesPersonnel,
          visit_accountType: accountsString,
          visit_accountType_others: item.visit_accountType_others,
          visit_payolaMerchandiser: item.visit_payolaMerchandiser,
          visit_averageOffTakePd: item.visit_averageOffTakePd,
          visit_isr: isrReqString,
          visit_isrNeed: isrNeedString,
          pod_canned: podsCannedString,
          pod_mpp: podsMPPString,
          pod_mpp_other: item.pod_mpp_other,
          pod_canned_other: item.pod_canned_other,
          isr_needOthers: item.isr_needsOthers,
          isr_reqOthers: item.isr_reqOthers,
          isr_needOThers: item.isr_needsOthers,
          visit_competitorsCheck: item.visit_competitorsCheck,
          visit_pap: papsString,
          pap_others: item.pap_others,
        });

        // Set row height
        row.height = 25; // Adjust the height as needed
      });

      // Generate Excel file and save it
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      FileSaver.saveAs(blob, 'market-visits.xlsx');
    } catch (error) {
      console.error('Error exporting data to Excel:', error);
      // Optionally, notify the user about the error
    }
  }

  showContent(content: string, id?: string) {
    this.sharedService.setSelectedContent(content);
    if (id) {
      this.sharedService.setSelectedId(id);
    }
  }
}
// function StartWith(arg0: string): import("rxjs").OperatorFunction<string | null, unknown> {
//   throw new Error('Function not implemented.');
// }
