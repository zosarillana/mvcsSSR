import { Component, ViewChild } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { initFlowbite } from 'flowbite';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { Isr } from '../../../../../models/isr';
import { PodService } from '../../../../../services/pod.service';
import { ModalCreatePodComponent } from '../pod-add/modal/modal-create-pod/modal-create-pod.component';
import { ModalDeletePodComponent } from '../pod-add/modal/modal-delete-pod/modal-delete-pod.component';
import { ModalEditPodComponent } from '../pod-add/modal/modal-edit-pod/modal-edit-pod.component';
import { ModalViewPodComponent } from '../pod-add/modal/modal-view-pod/modal-view-pod.component';
import { PapService } from '../../../../../services/pap.service';
import { Pap } from '../../../../../models/pap';
import { ModalCreatePapComponent } from './modal/modal-create-pap/modal-create-pap.component';
import { ModalEditPapComponent } from './modal/modal-edit-pap/modal-edit-pap.component';
import { ModalViewPapComponent } from './modal/modal-view-pap/modal-view-pap.component';
import { ModalDeletePapComponent } from './modal/modal-delete-pap/modal-delete-pap.component';
import { DatePipe } from '@angular/common';
import { FlowbiteService } from '../../../../../services/flowbite.service';
import { AuthService } from '../../../../../auth/auth.service';

@Component({
  selector: 'app-pap-add',
  templateUrl: './pap-add.component.html',
  styleUrl: './pap-add.component.css'
})
export class PapAddComponent {
  displayedColumns: string[] = [
    'pod_name',
    'others',
    
    'image_path',
    'description',
    'date_created',
    'action',
  ];
  dataSource = new MatTableDataSource<Pap>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  podCount: number = 0;
  startDate: Date | null = null;
  endDate: Date | null = null;
  private intervalId: any;


  // Construct the base API URL
  public imageUrlBase = `${environment.apiUrl}/Pap/image/`;  // <-- Use the environment API URL

  constructor(private authService: AuthService, private papService: PapService, public dialog: MatDialog, private datePipe: DatePipe, private flowbiteService: FlowbiteService) {}

  getFormattedVisitDate(visitDate: string | undefined): string {
    if (visitDate) {
      return this.datePipe.transform(new Date(visitDate), 'short') || 'No Date';
    }
    return 'No Date';
  }

  ngOnInit(): void {
    this.loadPods();
    this.startPolling();
    this.flowbiteService.loadFlowbite(flowbite => {
      // Your custom code here
      console.log('Flowbite loaded', flowbite);
    });
  }

  
  
  applyDateFilter(type: string, event: MatDatepickerInputEvent<Date>): void {
    const date = event.value;
  
    if (type === 'start') {
      this.startDate = date;
    } else {
      this.endDate = date;
    }
  
    this.dataSource.filterPredicate = (data: Pap) => {
      const createdDate = moment(data.date_created);
      const withinStart = this.startDate ? createdDate.isSameOrAfter(this.startDate) : true;
      const withinEnd = this.endDate ? createdDate.isSameOrBefore(this.endDate) : true;
      return withinStart && withinEnd;
    };
    this.dataSource.filter = '' + Math.random(); // Trigger filtering
  }
  

  loadPods(): void {
    this.papService.getPaps().subscribe((result: Pap[]) => {
      this.dataSource.data = result;
      this.dataSource.paginator = this.paginator; // Set paginator after data is loaded

      // Fetch pod count initially
      this.fetchPodCount();

      // Start polling for pod count
      this.startPolling();
    });
  }

  private fetchPodCount(): void {
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

  private startPolling(): void {
    // Clear any existing interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Set up polling every 3 seconds
    this.intervalId = setInterval(() => {
      if (this.authService.isLoggedIn()) {
        this.fetchPodCount();
      }
    }, 3000);
  }

  ngOnDestroy(): void {
    // Clean up polling interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  openViewDialog(pap: Pap): void {
    const dialogRef = this.dialog.open(ModalViewPapComponent, {
      width: '500px',
      data: pap,
    });

    dialogRef.afterClosed().subscribe(() => this.loadPods());
  }

  openEditDialog(pap: Pap): void {
    const dialogRef = this.dialog.open(ModalEditPapComponent, {
      width: '500px',
      data: pap,
    });

    dialogRef.afterClosed().subscribe(() => this.loadPods());
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(ModalCreatePapComponent, {
      width: '900px',
      height: 'auto',
      data: {},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPods();
      }
    });
  }

  openDeleteDialog(pap: Pap): void {
    const dialogRef = this.dialog.open(ModalDeletePapComponent, {
      width: '500px',
      data: pap,
    });

    dialogRef.afterClosed().subscribe(() => this.loadPods());
  }

}
