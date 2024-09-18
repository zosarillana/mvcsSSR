import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { Area } from '../../../../../models/area';
import { AreaService } from '../../../../../services/area.service';
import { ModalCreateAreaComponent } from './modal/modal-create-area/modal-create-area.component';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import moment from 'moment';
import { ModalViewAreaComponent } from './modal/modal-view-area/modal-view-area.component';
import { ModalDeleteAreaComponent } from './modal/modal-delete-area/modal-delete-area.component';
import { ModalEditAreaComponent } from './modal/modal-edit-area/modal-edit-area.component';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../../../auth/auth.service';
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
  areaCount: number = 0;
  startDate: Date | null = null;
  endDate: Date | null = null;

  private pollingSubscription: Subscription = new Subscription();
  private intervalId: any;

  constructor(
    private authService: AuthService,
    private areaService: AreaService,
    public dialog: MatDialog,
    private datePipe: DatePipe
  ) {}
  ngOnInit(): void {
    this.loadAreas();
    this.startPolling();
  }

  applyDateFilter(type: string, event: MatDatepickerInputEvent<Date>): void {
    const date = event.value;

    if (type === 'start') {
      this.startDate = date;
    } else {
      this.endDate = date;
    }

    this.dataSource.filterPredicate = (data: Area) => {
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

  loadAreas(): void {
    this.areaService.getAreas().subscribe((result: Area[]) => {
      this.dataSource.data = result;
      this.dataSource.paginator = this.paginator; // Set paginator after data is loaded
      this.fetchAreaCount();

      // Start polling for area count
      this.startPolling();
    });
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

  private startPolling(): void {
    // Clear any existing interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Set up polling every 3 seconds
    this.intervalId = setInterval(() => {
      if (this.authService.isLoggedIn()) {
        this.fetchAreaCount();
      }
    }, 3000);
  }

  ngOnDestroy(): void {
    // Clean up polling interval and subscriptions
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
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
