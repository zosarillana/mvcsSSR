import { AfterViewInit, Component, ViewChild, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import { MarketVisits } from '../../models/market-visits';
import { MarketVisitsService } from '../../services/market-visits.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalEditDialogComponent } from './modal/modal-edit-dialog/modal-edit-dialog.component';
import { ModalCreateDialogComponent } from './modal/modal-create-dialog/modal-create-dialog.component';
import { ModalDeleteDialogComponent } from './modal/modal-delete-dialog/modal-delete-dialog.component';
import { SharedService } from '../../services/shared.service';
import { initFlowbite } from 'flowbite';
import { AreaService } from '../../services/area.service';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import moment from 'moment';
import { Pod } from '../../models/pod';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';
import { FlowbiteService } from '../../services/flowbite.service';

@Component({
  selector: 'app-get-market-visits',
  templateUrl: './get-market-visits.component.html',
  styleUrls: ['./get-market-visits.component.css'],
})
export class GetMarketVisitsComponent implements AfterViewInit, OnInit {
  displayedColumns: string[] = [
    'visit_area',
    'visit_date',
    'visit_accountName',
    'visit_distributor',
    'visit_salesPersonnel',
    'visit_accountType',    
    'date_created',
    'action',
  ];

  private pollingSubscription!: Subscription;
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
  mvisitsToEdit?: MarketVisits;
  startDate: Date | null = null;
  endDate: Date | null = null;
  visitCount: number = 0;
  constructor(
    private flowbiteService: FlowbiteService,
    private datePipe: DatePipe,
    private marketVisitsService: MarketVisitsService,
    public dialog: MatDialog,
    private sharedService: SharedService // Inject SharedService
  ) {}

  ngOnInit(): void {
    this.startPolling();
    this.marketVisitsService
      .getMarketVisits()
      .subscribe((result: MarketVisits[]) => {
        this.dataSource.data = result;
      });
      this.flowbiteService.loadFlowbite(flowbite => {
        // Your custom code here
        console.log('Flowbite loaded', flowbite);
      });    
  }

  loadMarketVisits(): void {
    this.marketVisitsService
      .getMarketVisits()
      .subscribe((result: MarketVisits[]) => {
        this.dataSource.data = result;
      });
  }

  getFormattedVisitDate(visitDate: string | undefined): string {
    if (visitDate) {
      return this.datePipe.transform(new Date(visitDate), 'short') || 'No Date';
    }
    return 'No Date';
  }
  

  private startPolling(): void {
    this.pollingSubscription = this.marketVisitsService
      .getVisitCount()
      .subscribe(
        (count: number) => (this.visitCount = count),
        (error) => console.error('Error fetching visit count:', error)
      );

    setInterval(() => this.fetchUserCount(), 3000);
  }

  private fetchUserCount(): void {
    this.marketVisitsService.getVisitCount().subscribe(
      (count: number) => {
        this.visitCount = count;
      },
      (error) => {
        console.error('Error fetching pod count:', error);
      }
    );
  }

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

  openEditDialog(mvisit: MarketVisits): void {
    const dialogRef = this.dialog.open(ModalEditDialogComponent, {
      width: '500px',
      data: mvisit,
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('The dialog was closed');
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(ModalCreateDialogComponent, {
      panelClass: 'custom-dialog',
      width: '2000px',
      height: '1000px',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadMarketVisits();
      }
    });
  }

  openDeleteDialog(mvisit: MarketVisits): void {
    const dialogRef = this.dialog.open(ModalDeleteDialogComponent, {
      width: '500px',
      data: mvisit,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
      if (result) {
        this.loadMarketVisits();
      }
    });
  }

  applyDateFilter(type: string, event: MatDatepickerInputEvent<Date>): void {
    const date = event.value;

    if (type === 'start') {
      this.startDate = date;
    } else {
      this.endDate = date;
    }

    this.dataSource.filterPredicate = (data: MarketVisits) => {
      const createdDate = moment(data.date_created);
      const withinStart = this.startDate
        ? createdDate.isSameOrAfter(this.startDate)
        : true;
      const withinEnd = this.endDate
        ? createdDate.isSameOrBefore(this.endDate)
        : true;
      return withinStart && withinEnd;
    };
    this.dataSource.filter = '' + Math.random(); // Trigger filtering
  }

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
         const isrNeedString = isrsForNeeds.length > 0
           ? isrsForNeeds.map((isr) => isr.isr_name).join(', ')
           : 'No ISR Needs';

         const isrsForReqs = this.filterIsrsForReqs(item.isrs);
         const isrReqString = isrsForReqs.length > 0
           ? isrsForReqs.map((isr) => isr.isr_name).join(', ')
           : 'No ISR Requirements';
        
            // Filter PODs
         const podsForCanned = this.filterPodsForCanned(item.pods);
         const podsCannedString = podsForCanned.length > 0
           ? podsForCanned.map((pod) => pod.pod_name).join(', ')
           : 'No ISR CANNED';

         const podsForMPP = this.filterPodsForMpp(item.pods);
         const podsMPPString = podsForMPP.length > 0
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
          pap_others:item.pap_others,
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
