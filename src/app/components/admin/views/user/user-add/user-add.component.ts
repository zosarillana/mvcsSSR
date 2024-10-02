import { Component, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ModalCreateUserDialogComponent } from './modal/modal-create-user-dialog/modal-create-user-dialog.component';
import { ModalEditUserDialogComponent } from './modal/modal-edit-user-dialog/modal-edit-user-dialog.component';
import { ModalDeleteUserDialogComponent } from './modal/modal-delete-user-dialog/modal-delete-user-dialog.component';
import { ModalViewUserDialogComponent } from './modal/modal-view-user-dialog/modal-view-user-dialog.component';
import { User } from '../../../../../models/user';
import { UserService } from '../../../../../services/user.service';
import { FlowbiteService } from '../../../../../services/flowbite.service';
import { map, Observable, startWith, Subscription } from 'rxjs';
import { AuthService } from '../../../../../auth/auth.service';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SseService } from '../../../../../services/sse.service';
@Component({
  selector: 'app-user-add',
  templateUrl: './user-add.component.html',
  styleUrl: './user-add.component.css',
})
export class UserAddComponent {
  displayedColumns: string[] = [
    'id',
    'fullname',
    'username',
    'email_add',
    'contact_num',
    'date_created',
    'action',
  ];
  dataSource = new MatTableDataSource<User>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  userToEdit?: User;
  startDate: Date | null = null;
  endDate: Date | null = null;
  userCount: number = 0;
  users: User[] = [];
  myControl = new FormControl('');
  options: string[] = []; // Initialize as empty
  filteredOptions!: Observable<string[]>;
  private subscription: Subscription = new Subscription();
  // private intervalId: any;
  constructor(
    private authService: AuthService,
    private userService: UserService,
    public dialog: MatDialog,
    private flowbiteService: FlowbiteService,
    private matSnackBar: MatSnackBar,
    private sseService: SseService
  ) {}

  ngOnInit(): void {
    this.subscribeToSseMessages();
    this.fetchUserCount();   
    this.loadUsers();
    this.userService.getUsers().subscribe(
      (data) => {
        this.users = data || [];
        this.setupAutocomplete();
      },
      (error) => {
        console.error('Error fetching market visits', error);
      }
    );
    this.flowbiteService.loadFlowbite((flowbite) => {
      // Your custom code here
      // console.log('Flowbite loaded', flowbite);
    });
  }

  fetchUsers(): void {
    this.userService.getUsers().subscribe((users: User[]) => {
      // Add a fullname property to each user
      this.users = users.map((user) => ({
        ...user,
        fullname: `${user.fname} ${user.mname ? user.mname + ' ' : ''}${
          user.lname
        }`,
      }));
      this.dataSource.data = this.users; // Set initial data for the table
      this.setupAutocomplete(); // Call setupAutocomplete after fetching users
    });
  }

  setupAutocomplete() {
    // Setup autocomplete filtering
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) =>
        this._filter(
          value ?? '',
          this.users.map(
            (user) =>
              `${user.fname} ${user.mname ? user.mname + ' ' : ''}${user.lname}`
          )
        )
      ) // Create fullname on the fly
    );
  }

  private _filter(value: string, options: string[]): string[] {
    const filterValue = value.toLowerCase();
    const filterTerms = filterValue.split(' ').filter((term) => term); // Split by space and filter out empty terms

    return options.filter((option) => {
      const optionLower = option.toLowerCase();
      return filterTerms.every((term) => optionLower.includes(term)); // Ensure all terms are included in the option
    });
  }

  applyFilter(event: Event, filterType: string): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim().toLowerCase(); // Convert to lower case

    if (filterType === 'fullname') {
      this.dataSource.filterPredicate = (data: User) => {
        const fullname = `${data.fname} ${data.mname ? data.mname + ' ' : ''}${
          data.lname
        }`.toLowerCase();
        return fullname.includes(value); // Check against the combined fullname
      };
      this.dataSource.filter = value; // Apply the filter
    }
  }

  applyFilterOnSelect(selectedOption: string): void {
    // Log the selected option
    // console.log('Selected option:', selectedOption);

    const selectedValue = selectedOption.toLowerCase(); // Convert selected option to lower case

    // Define the filter predicate
    this.dataSource.filterPredicate = (data: User) => {
      const fullname = `${data.fname} ${data.mname ? data.mname + ' ' : ''}${
        data.lname
      }`.toLowerCase();
      return fullname.includes(selectedValue); // Check against the combined fullname
    };

    // Apply the new filter
    this.dataSource.filter = selectedValue; // Set the filter based on selected option
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe((result: User[]) => {
      this.dataSource.data = result;
      this.dataSource.paginator = this.paginator;
    });
  }

  private fetchUserCount(): void {
    if (this.authService.isLoggedIn()) {
      this.userService.getUserCount().subscribe(
        (count: number) => {
          this.userCount = count;
        },
        (error) => {
          console.error('Error fetching user count:', error);
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
        this.userService.getUsers().subscribe(
          (result: User[]) => {
            this.users = result || []; // Update the local data
            this.setupAutocomplete(); // Reinitialize autocomplete
            this.fetchUserCount();
            this.updateDataSource(result); // Update data source for your table or list
          },
          (error) => {
            console.error('Error fetching market visits on SSE update:', error);
          }
        );
      })
    );
  }
  private updateDataSource(result: User[]): void {
    let dataToDisplay = result;

    if (this.startDate && this.endDate) {
      dataToDisplay = dataToDisplay.filter((user) => {
        const visitDate = new Date(user.date_updated);
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
    this.userService.getUsers().subscribe((result: User[]) => {
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

      this.dataSource.data = dataToDisplay;
    });
  }

  ngOnDestroy(): void {
    // Clear the polling interval when the component is destroyed
    // if (this.intervalId) {
    //   clearInterval(this.intervalId);
    // }
  }

  openEditDialog(user: User): void {
    const dialogRef = this.dialog.open(ModalEditUserDialogComponent, {
      width: '45vw', // Adjust the width to a percentage of the viewport width
      maxWidth: '45vw', // Optional: ensure it doesn’t exceed a maximum width
      height: '67%', // Keep or adjust the height as needed
      data: user,
    });

    dialogRef.afterClosed().subscribe(() => {
      this.loadUsers();
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(ModalCreateUserDialogComponent, {
      width: '45vw', // Adjust the width to a percentage of the viewport width
      maxWidth: '45vw', // Optional: ensure it doesn’t exceed a maximum width
      height: '67%', // Keep or adjust the height as needed
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  openDeleteDialog(user: User): void {
    const dialogRef = this.dialog.open(ModalDeleteUserDialogComponent, {
      width: '500px',
      data: user,
    });

    dialogRef.afterClosed().subscribe(() => {
      this.loadUsers();
    });
  }

  openViewDialog(user: User): void {
    const dialogRef = this.dialog.open(ModalViewUserDialogComponent, {
      width: '45vw', // Adjust the width to a percentage of the viewport width
      maxWidth: '45vw', // Optional: ensure it doesn’t exceed a maximum width
      height: '67%', // Keep or adjust the height as needed
      data: user,
    });

    dialogRef.afterClosed().subscribe(() => {
      this.loadUsers();
    });
  }
}
