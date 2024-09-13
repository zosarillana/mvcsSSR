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
import { IsrService } from '../../../../../services/isr.service';
import { ModalCreateIsrComponent } from '../isr-add/modal/modal-create-isr/modal-create-isr.component';
import { ModalDeleteIsrComponent } from '../isr-add/modal/modal-delete-isr/modal-delete-isr.component';
import { ModalEditIsrComponent } from '../isr-add/modal/modal-edit-isr/modal-edit-isr.component';
import { ModalViewIsrComponent } from '../isr-add/modal/modal-view-isr/modal-view-isr.component';
import { ModalCreatePodComponent } from './modal/modal-create-pod/modal-create-pod.component';
import { PodService } from '../../../../../services/pod.service';
import { ModalEditPodComponent } from './modal/modal-edit-pod/modal-edit-pod.component';
import { ModalViewPodComponent } from './modal/modal-view-pod/modal-view-pod.component';
import { ModalDeletePodComponent } from './modal/modal-delete-pod/modal-delete-pod.component';
import { ModalDeletePapComponent } from '../pap-add/modal/modal-delete-pap/modal-delete-pap.component';
import { Pod } from '../../../../../models/pod';
import { DatePipe } from '@angular/common';
import { FlowbiteService } from '../../../../../services/flowbite.service';
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
    'image_path',
    'description',
    'date_created',
    'action',
  ];
  dataSource = new MatTableDataSource<Pod>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  podCount: number = 0;
  startDate: Date | null = null;
  endDate: Date | null = null;

  private pollingSubscription!: Subscription;

  // Construct the base API URL
  public imageUrlBase = `${environment.apiUrl}/Pod/image/`; // <-- Use the environment API URL

  constructor(
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
    this.loadPods();
    this.startPolling();
    this.flowbiteService.loadFlowbite(flowbite => {
      // Your custom code here
      console.log('Flowbite loaded', flowbite);
    });
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  applyDateFilter(type: string, event: MatDatepickerInputEvent<Date>): void {
    const date = event.value;

    if (type === 'start') {
      this.startDate = date;
    } else {
      this.endDate = date;
    }

    this.dataSource.filterPredicate = (data: Pod) => {
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

  loadPods(): void {
    this.podService.getPods().subscribe((result: Pod[]) => {
      this.dataSource.data = result;
      this.dataSource.paginator = this.paginator; // Set paginator after data is loaded
      this.fetchUserCount();
    });
  }

  private startPolling(): void {
    this.pollingSubscription = this.podService.getPodsCount().subscribe(
      (count: number) => (this.podCount = count),
      (error) => console.error('Error fetching Pod count:', error)
    );

    setInterval(() => this.fetchUserCount(), 3000);
  }

  private fetchUserCount(): void {
    this.podService.getPodsCount().subscribe(
      (count: number) => {
        this.podCount = count;
      },
      (error) => {
        console.error('Error fetching pod count:', error);
      }
    );
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
